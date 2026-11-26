# 0017. A collective assembly: multi-signature first, a delay on rotation second

Status: Accepted for A and C, implemented and verified on testnet (see Verification). B remains a later step. Extends [0004](0004-assembly-role.md), which accepted a single assembly account for the prototype.

## Context

The assembly role is the root of trust ([0004](0004-assembly-role.md), [05-risks-and-limits.md](../05-risks-and-limits.md)). Whoever controls it can approve vendors, change the budget, replace the administrator and rotate the council to addresses of their own. In the prototype it is one account, so one person can undo every rule the contract enforces. This is the largest gap between the demo and a building that could use it.

A real assembly is a group of owners that decides by vote. In Colombia (Law 675 of 2001) votes are weighted by each unit's coefficient of ownership; this is to be confirmed with a lawyer before it shapes the design.

The contract stores the assembly as an `Address` and checks it with `require_auth()`. In Soroban an `Address` can be an ordinary account, a native Stellar multi-signature account or a custom account contract. This matters: the assembly can already be something other than one key, without changing the treasury contract.

## Options

| | A. Native multi-signature account as the assembly | B. An assembly contract with weighted votes | C. A delay on council rotation inside the treasury |
|---|---|---|---|
| What it is | The assembly address is a Stellar account whose signers are owners' representatives, with a signature threshold | A second contract holds proposals and votes weighted by coefficient, and calls the treasury once a vote passes | `rotate_council` and `set_administrator` become two steps: announce, then execute after a waiting period. The assembly can cancel in between |
| Contract change | None | New contract, and the treasury accepts it as the assembly | Yes, in the treasury |
| Effort | Days: a deployment script, a test and a guide | Weeks: voting rules, quorum, weights, a UI | Days: two entry points, storage, events, tests |
| Residents can see | Which signers approved a rule change (the transaction shows it) | Each vote and its weight | The announced change before it takes effect |
| Limits | Equal weight per signer, no coefficient. Rotating signers is a classic Stellar operation outside the contract. No waiting period | The most faithful to a real assembly, and the largest new attack surface | Does not decide who votes. It only gives residents time to react |

## Decision

Do A and C now, and leave B as the direction.

1. **A. Deploy with a native multi-signature account as the assembly.** The contract needs no change. The work is to build the account (for example 3 representatives, 2 of 3 required), deploy the treasury with it as `assembly`, and show on testnet that a rule change signed by one representative is rejected and one signed by two is accepted. This was verified on testnet (see Verification).
2. **C. Add a waiting period to council rotation.** The constructor takes a `rotation_delay` in seconds. With a delay, `rotate_council` is refused and the assembly uses `announce_rotation`, which emits an event with the new members and the time they can take over, and `execute_rotation` after the delay. The assembly can `cancel_rotation` until then, and the new council is validated again when it runs. With a delay of zero the contract behaves as before. The delay covers the council because the council is what approves payments. Replacing the administrator, who can only propose, and changing budget lines and vendors stay immediate: none of them moves money outside the existing limits. This leaves a path to watch, since an assembly could approve a vendor and raise a limit at once; those changes are public and each emits an event, but they are not delayed.
3. **B stays a later step.** A weighted on-chain vote needs the legal question answered first, and a pilot that tells us how real assemblies decide.

## Verification of option A

[scripts/demo-multisig-assembly.ps1](../../scripts/demo-multisig-assembly.ps1) does it end to end on testnet. It creates a Stellar account with three representatives as signers (weight 1 each), every threshold at 2 and the master key at weight 0, deploys a treasury with that account as the assembly, and changes a budget line:

- Signed by one representative, the network rejects the transaction with `TxBadAuth`.
- Signed by two, it succeeds, and `get_budget` returns the new limit.

Run on 25 November 2026: the assembly account is `GBPZIFBLEZLMV5ZSWAEMTPDLM6VRUSUZLQOCYXZCVHX74Z65A6L2AN5Y`, the treasury `CAETP2Y63VQR4RGL3RBFTRNYFP3F3FHTCTQXPAYTY3RWCVXDYWC4A6R4` and the accepted transaction [afe93925...3877](https://stellar.expert/explorer/testnet/tx/afe93925062d0a5a59503981bcef1f7bdc870a206e224cc700069034933d3877). The rotation delay was run on 25 November 2026 with treasury `CB2KCDP62NWLG2FWODVEX4HMW4KW573MWU6BZL2HTKKL52OPARE2LZ3Q`: [announced](https://stellar.expert/explorer/testnet/tx/b393573edace59ca8e4aa2e988648744e697268a57c8ab3c67ce82f646d89539) and [executed](https://stellar.expert/explorer/testnet/tx/3b0b38dc080f92664ced1b506546068de8af9e8b78a9e5ff3d64375cd081efe8). The testnet is reset periodically, so these will disappear; rerun the script.

The same script then shows the delay on testnet: `rotate_council` is refused with error 20, `announce_rotation` is accepted, `execute_rotation` is refused with error 23 until the delay passes, and after the wait the council changes and `get_pending_rotation` returns nothing. The script uses a 45 second delay so it can run in a minute; a building would choose days.

What this does not tell us:

- The rejection happens in the network, when it checks the transaction's signatures, before the contract runs. The result is the same for the user (no single person changes the rules), but the contract is not what refuses.
- All three thresholds were set to 2, so the test does not show which one Soroban applies to this call. Anyone reusing the setup should keep them equal.
- The assembly account is the transaction's source, so its signatures are on the transaction itself. Signing the authorization separately, for a transaction sent by someone else, was not tried.

## Consequences

- The most serious limit in the risk document gets a concrete, testable answer without a rewrite. The honest claim becomes "no single person can change the rules", not "the assembly votes on-chain".
- With A, signers hold equal weight. A building where units differ in size needs B.
- With C, rotating the council is slower on purpose. If the council loses its keys, the assembly waits out the delay. The waiting period must be a parameter fixed at deployment, and its length is open (a first proposal is 48 hours on testnet, to be decided with a pilot building).
- C adds three entry points, two readers, storage and events, and four error codes appended after the existing ones (20 to 23, the numbers are a public interface). It adds 17 tests. The constructor gains an argument, so the web app's generated bindings and the demo treasury it points to are unchanged until the demo is redeployed and the bindings regenerated.
- The assembly keeps its own limit: if its signers lose their keys, the rules cannot change. Key recovery for the assembly remains an open question.
- The real contract is still unaudited. Nothing here makes it fit for real funds.

## Open questions

- Who are the signers in a real building, and how are they chosen and replaced?
- How long should the waiting period be?
- Whether Law 675 allows a signature of representatives to stand for an assembly vote.
- Whether a delay on vendor and budget changes is also needed.

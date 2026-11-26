# 0017. A collective assembly: multi-signature first, a delay on rotation second

Status: Proposed. Extends [0004](0004-assembly-role.md), which accepted a single assembly account for the prototype.

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

1. **A. Deploy with a native multi-signature account as the assembly.** The contract needs no change. The work is to build the account (for example 3 representatives, 2 of 3 required), deploy the treasury with it as `assembly`, and show on testnet that a rule change signed by one representative is rejected and one signed by two is accepted. To verify first: that the account's threshold is what Soroban applies to `require_auth()` for the rule-changing calls.
2. **C. Add a waiting period to `rotate_council` and `set_administrator`.** The assembly announces the change, the contract emits an event with the new members and the time it can run, and a second call executes it after the delay. The assembly can cancel a pending change. Budget and vendor changes stay immediate, because they cannot move money outside the existing limits.
3. **B stays a later step.** A weighted on-chain vote needs the legal question answered first, and a pilot that tells us how real assemblies decide.

## Consequences

- The most serious limit in the risk document gets a concrete, testable answer without a rewrite. The honest claim becomes "no single person can change the rules", not "the assembly votes on-chain".
- With A, signers hold equal weight. A building where units differ in size needs B.
- With C, rotating the council is slower on purpose. If the council loses its keys, the assembly waits out the delay. The waiting period must be a parameter fixed at deployment, and its length is open (a first proposal is 48 hours on testnet, to be decided with a pilot building).
- C adds entry points, storage and events, so it needs new tests, an update of [03-contract-design.md](../03-contract-design.md) and new error codes appended after the existing ones (the numbers are a public interface).
- The assembly keeps its own limit: if its signers lose their keys, the rules cannot change. Key recovery for the assembly remains an open question.
- The real contract is still unaudited. Nothing here makes it fit for real funds.

## Open questions

- Who are the signers in a real building, and how are they chosen and replaced?
- How long should the waiting period be?
- Whether Law 675 allows a signature of representatives to stand for an assembly vote.

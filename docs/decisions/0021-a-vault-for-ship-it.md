# 0021. A separate vault contract for the Ship It "Bóveda" mission

Status: Accepted. Applies to testnet only.

## Context

The Ship It mission "Bóveda" (26 November 2026, 12:00 to 16:00, Mexico City) asks for a contract on testnet that holds 5555 XLM and releases them only to whoever presents the code "Ship It", and a public screen in the app where a testnet wallet connects, types the code and claims. The reviewers open the app, claim with the code, and approve the entry if the XLM arrive.

Quintti's treasury cannot do this. Its money leaves only through an expense that the budget, the vendor list and the council allow. Bending it into a vault would weaken the rules that make it a treasury.

## Decision

1. **A second contract, `contracts/vault`, apart from the treasury.** The treasury is untouched.
2. **The vault is opened with the SHA-256 of the code, in lowercase.** The code is never stored. The contract lowercases the ASCII letters it receives before hashing, so "Ship It", "SHIP IT" and "ship it" all open it. Whitespace is not ignored by the contract; the app trims what people type.
3. **Each account claims a fixed share, once.** The vault holds 5555 XLM and pays 55.55 XLM per account, so it serves 100 accounts. The alternative, paying the whole balance to the first claimer, would leave every later reviewer with an error, and the mission is approved when the XLM arrive. The share and the code are constructor arguments, so another reading of the mission needs a new deployment and nothing else.
4. **No owner and no withdrawal.** The only way out is `claim`. The unclaimed XLM are testnet coins and have no value, and an owner key would contradict "only release to whoever presents the code". The cost is that the locked XLM cannot be recovered.
5. **A wrong code is rejected in simulation.** The wallet is never asked to sign it and no fee is paid.
6. **The page lives at `/boveda`, outside `/app`.** The vault is not a building, so it has none of the building's roles or saved-building rules. It reuses the wallet session and the transaction layer.
7. **Errors are read with the vault's own table.** The treasury and the vault both number their errors from 1, so `#1` is `NotInitialized` in one and `WrongCode` in the other. The vault's codes are named in `features/vault`, a test checks that list against the generated bindings, and a failure inside another contract (the token) keeps the `other-contract` kind from [0020](0020-deposits-and-errors-from-other-contracts.md).

## Consequences

- The deployed vault is `CAFRW3R4IACGOX62V7WGXEYFXHUIVLNHGBXG7CGKDX42LSXNCR4M274H` on testnet, funded with 5555 XLM. `scripts/deploy-vault.ps1` deploys another (a dry run unless `-Execute`).
- The app reads the vault from `NEXT_PUBLIC_VAULT_CONTRACT_ID`. Without it `/boveda` says the vault is not set up, and nothing else changes.
- A person can drain the vault only by claiming from 100 different accounts. Creating testnet accounts costs nothing, so this is not a security property. Testnet XLM have no value.
- The code is public (it is the name of the challenge), so hashing it hides nothing from a reviewer. It stops the deployment transaction from spelling it out, which is how a vault is normally built.
- Not audited. Testnet only.
- Checked: 18 contract tests, a rehearsal on testnet (a wrong code gives error 1, the right code pays 55.55 XLM, a second claim gives error 2) and 34 frontend tests. **Not checked: a claim signed from a browser wallet extension.**

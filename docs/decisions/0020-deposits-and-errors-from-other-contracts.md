# 0020. Deposits from the app, and an error is read by the contract that raised it

Status: Accepted. Extends [0008](0008-read-simulation-errors-directly.md).

## Context

A building could only be funded from the command line. For a pilot the people who pay are administrators and council members, not developers, so the app needs a way to put money into the treasury.

Building it exposed a problem in how errors are read. [0008](0008-read-simulation-errors-directly.md) made the app read the simulation's `Error(Contract, #n)` and look `n` up in the treasury's error table. That is only right when the treasury raised the error. A deposit moves tokens, so the check "does the account hold enough" happens inside the **token** contract. Measured on testnet, a deposit from an account with too little fails with:

- `Error(Contract, #10)` for an amount above the balance, and
- `Error(Contract, #12)` for an absurdly large amount.

In the treasury's table, 10 is `VendorNotApproved` and 12 is `OverBudget`. The person trying to deposit would have been told "that vendor is not approved" or "this expense exceeds the budget".

The simulation's diagnostic events show what happened. They name the contract that raised each error, and the treasury repeats the code as it passes the failure up. For the failed deposit the first `error` event is emitted by the token (`CDLZ…`), the next two by the treasury, all with the same code.

## Decision

**Deposits.** A **Depositar** screen at `/app/depositar`, reached from the overview. It asks for an amount, shows what the connected account holds and what the treasury would hold after, and signs `deposit(from, amount)` with the wallet.

- **No role is needed.** The contract lets any account pay. The button shows for everyone, a neighbour included; without a wallet the form asks to connect one.
- **The building must be saved.** On a building opened from a link and not saved ([0019](0019-buildings-by-link-without-a-backend.md)) the screen shows no amount field and no button, and the write hook refuses as well. A deposit cannot be taken back, so this is the place where sending money to a contract that only looks like the building would hurt most.
- **The payer's balance is read before asking for a signature.** `lib/stellar/token-balance.ts` simulates the token's `balance` for the connected account. The form marks "you have enough" only when that read succeeded. A failed read does not block the person: the simulation still rejects a deposit that cannot be paid.
- **The text says what the money can and cannot do.** Money deposited leaves only through an expense the administration proposed and the council approved, to an approved vendor and within the budget. This was checked against the contract: it has no withdrawal function, so not even the depositor can take the money back.

**Errors.** `lib/stellar/error-origin.ts` finds the contract behind a failed simulation: the contract of the first `error` event. `transaction-service` compares it with the contract the call was addressed to:

- Same contract: the code is read with the treasury's table, as before.
- Another contract: the error becomes `AppError` of kind `other-contract` with the code in `foreignCode`, and the code is **not** looked up in the treasury's table.
- No events, or events that cannot be read: nothing changes. The events are advice about a failure, so reading them can never throw.

`copy/errors.es.ts` names only the codes that were seen on the network, for the Stellar Asset Contract that wraps XLM: 10 (not enough balance) and 12 (amount too large). Any other code, or any other token, gets a general "otro contrato rechazó la operación".

## Consequences

- A deposit from an account with too little now says so, in words, before any signature.
- The rule is general. Any future call that reaches another contract gets the same protection, not only deposits.
- **The codes 10 and 12 are an observation, not a specification.** They were measured on testnet for XLM's Stellar Asset Contract. Another token may number its errors differently, so the app would show the general message, or at worst a wrong specific one if a token reuses 10 for something else. A building that uses another token needs its codes checked.
- The reading depends on the shape of the diagnostic events that the RPC returns. If that changes, the tests that build events in the real shape fail, and the app falls back to the treasury's table, which is the behaviour of 0008.
- **Not tested with a browser wallet.** The amount check, the building lock and the screens were checked in a browser. The signing path was exercised against testnet with a key held in memory instead of a wallet extension: a deposit of 1 XLM moved the treasury's balance from 0 to 10,000,000 stroops. The click on a real wallet's prompt has not been tried.
- The form leaves some money in the wallet by advice only. Native XLM needs a minimum balance, so depositing the whole balance fails at simulation with the same error 10. The text says so; the app does not compute the reserve.

## Alternatives considered

- **Map the codes by contract in a table** (the token's codes next to the treasury's). Rejected: it grows with every token and still guesses when the contract is unknown. Saying "another contract" and naming only what was seen is honest and small.
- **Only check the balance in the form and leave errors as they were.** Rejected: the form can only guard what it reads, and the next call that reaches another contract would repeat the bug.
- **A withdrawal for the depositor.** Not built, and against the product: the point is that nobody can move the money outside the rules.

# 0006. The approval that reaches the threshold executes the payment

Status: Accepted

## Context

Payment could be a separate step after approvals, triggered by anyone. That adds a transaction, a state (approved but not paid) and a point where a flow can stall.

## Decision

`approve_expense` records the approval. When the count of current council members who approved reaches the threshold, the same call rechecks the rules, updates the state and transfers the tokens to the vendor.

## Consequences

- One fewer step and one fewer state, which simplifies the contract and the demo.
- The last approver pays the network fee for the transaction.
- If a rule fails at that moment (budget, vendor, balance), the whole transaction reverts, including the approval being recorded. The proposal stays pending and is cancelled or fixed by the assembly.
- State is updated before the token transfer.

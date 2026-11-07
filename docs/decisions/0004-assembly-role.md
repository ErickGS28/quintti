# 0004. An assembly role changes rules but cannot move funds

Status: Accepted for the prototype

## Context

The budget, the approved vendors and the council are decided by the building's assembly. Someone must be able to write those rules into the contract, and to replace the administrator or council when they change. Meanwhile the principle is that no single actor can move funds.

## Decision

The contract has an **assembly role**, a single address set at initialization. It can set budget lines, approve or remove vendors, replace the administrator, rotate the council and threshold, and cancel a pending expense. It has **no entry point that transfers funds** and it cannot approve expenses.

## Consequences

- Rule changes are explicit, minimal and public (each emits an event).
- The assembly role is still the **root of trust**: it could rotate the council to addresses it controls. This is a real limit, stated in [05-risks-and-limits.md](../05-risks-and-limits.md).
- In the prototype the role is one account. A real building needs a collective mechanism, for example a multi-signature account of owners' representatives or an on-chain vote. That is outside this prototype.
- A time delay on council rotation is a possible later mitigation.

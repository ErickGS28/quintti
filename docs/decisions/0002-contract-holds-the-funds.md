# 0002. The contract holds the funds, not a native multi-signature account

Status: Accepted

## Context

Stellar accounts support native multi-signature with weights and thresholds. That would let the council co-sign payments from a shared account. But a native multi-signature account only enforces **who signs**. It cannot enforce **what is signed**: a budget limit per category, an approved vendor list, or the separation between administrator and council. The signers could still pay anything to anyone.

## Decision

Funds are held by a Soroban contract as a token balance. Moving them is only possible through the contract's expense flow, which checks the rules and the council's approvals. Council members authorize with their own addresses on each approval.

## Consequences

- The assembly's rules are enforced by the account itself, which is the point of the product.
- Each council member signs their own transaction, so no off-chain signature collection is needed.
- The contract becomes the security-critical component. It needs thorough tests and, before real value, an audit.
- There is no upgrade path, so a fix means a new deployment ([03-contract-design.md](../03-contract-design.md)).
- Tokens are sent to the contract address. The token must be a Stellar Asset Contract or a compatible token.

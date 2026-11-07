# Design decisions

One decision per file, short and with its rationale. If a decision changes, a new one is written and the previous one is marked as superseded.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-name.md) | Name: Quintti | Accepted |
| [0002](0002-contract-holds-the-funds.md) | The contract holds the funds, not a native multi-signature account | Accepted |
| [0003](0003-spending-side-first.md) | The prototype covers how money leaves, not how it arrives | Accepted |
| [0004](0004-assembly-role.md) | An assembly role changes rules but cannot move funds | Accepted for the prototype |
| [0005](0005-invoice-hash-on-chain.md) | Invoice fingerprint on-chain, file off-chain | Accepted |
| [0006](0006-final-approval-pays.md) | The approval that reaches the threshold executes the payment | Accepted |
| [0007](0007-no-backend.md) | No backend in the prototype | Accepted, amended by 0013 |
| [0008](0008-read-simulation-errors-directly.md) | Read simulation errors directly to keep the contract error code | Accepted |
| [0009](0009-design-direction.md) | Design direction: light Cupertino in the new purple palette | Accepted, amended by 0010 |
| [0010](0010-landing-as-colored-chapters.md) | The landing page as full-screen chapters in all five colors | Accepted, amended by 0011 |
| [0011](0011-landing-polish.md) | Landing polish: Geist, texture, a light that follows the pointer, lighter chapter openings | Accepted |
| [0012](0012-one-role-aware-app-with-a-sidebar.md) | One role-aware app with a sidebar | Accepted |
| [0013](0013-offchain-records-in-supabase.md) | Off-chain records in Supabase, verified against the contract | Accepted |

## Template

```
# NNNN. Title

Status: Proposed | Accepted | Superseded by NNNN

## Context
## Decision
## Consequences
```

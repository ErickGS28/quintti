# 0003. The prototype covers how money leaves, not how it arrives

Status: Accepted

## Context

Opacity and misuse happen when money is spent. Collecting fees from residents in local currency needs an on-ramp (an anchor), which depends on third parties, varies by country and is hard to demonstrate reliably in a short build.

## Decision

The prototype enforces and shows **expenses**: proposal, approval, payment and public receipts. The treasury is funded directly with testnet tokens. Fee collection and per-unit accounting are out of scope.

## Consequences

- The demo does not depend on a fiat on-ramp.
- The pitch must say plainly that collection is a next step.
- Fee collection is documented as a future phase in [01-vision.md](../01-vision.md) and [05-risks-and-limits.md](../05-risks-and-limits.md).

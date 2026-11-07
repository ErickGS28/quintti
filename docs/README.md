# Quintti documentation

| # | Document | Purpose |
|---|----------|---------|
| 0 | [00-idea.md](00-idea.md) | The idea in plain terms: what it is, the pain, who it is for |
| 1 | [01-vision.md](01-vision.md) | Problem, solution, value, why Stellar, business model |
| 2 | [02-product-and-flows.md](02-product-and-flows.md) | Actors, concepts, flows and screens |
| 3 | [03-contract-design.md](03-contract-design.md) | Contract state, entry points, rules, errors and tests |
| 4 | [04-architecture-and-stack.md](04-architecture-and-stack.md) | Components, stack and repository structure |
| 5 | [05-risks-and-limits.md](05-risks-and-limits.md) | Known limits, risks and common objections |
| 6 | [06-getting-started.md](06-getting-started.md) | Build, test and deploy your own copy on testnet |
| — | [../CHANGELOG.md](../CHANGELOG.md) | Current state and history of changes |
| — | [decisions/](decisions/README.md) | Design decisions and their rationale |

Recommended reading order: 0 → 1 → 2 → 3.

## Conventions

- All documents in this folder are written in English.
- Facts that can change (library versions, endpoints, CLI flags, SDK APIs) are marked as *to verify* until they are checked against the official documentation at `developers.stellar.org`.
- Figures about prices and adoption are hypotheses until validated with real users, and are labelled as such.
- If a document and the code disagree, fix the one that is wrong in the same change.

## Not written yet

- **Visual design:** the logo and palette are pending. A design document is added when they are defined. Until then the interface is built on neutral, centralized tokens so the brand can be applied later without rework.

# Quintti

A shared treasury for residential buildings, with the assembly's rules built into the account. Built on Stellar and Soroban.

> **Status:** hackathon prototype for Código Cordillera (BAF × Stellar). The treasury contract is implemented and tested. The web app has the landing page and the treasury app: overview, expenses (propose, approve, cancel, check the invoice) and rules (budget and vendors), with Stellar Wallets Kit for signing, and a hidden manual at `/hiw`. What is left before the demo is signing with a real wallet extension and having the evidence of the contract on testnet. Testnet only, unaudited, not for real funds.

## The problem

In most residential buildings, owners pay a monthly fee into an account they cannot inspect. One person, the administrator, decides how it is spent. The budget the assembly approves is a recommendation, invoices arrive weeks later as a PDF or a spreadsheet, and when the administrator changes, the history is lost. The money belongs to everyone, but control belongs to very few.

## What Quintti does

Quintti moves the assembly's rules into the account itself:

- **Budget limits per category.** The assembly loads the approved budget (maintenance, security, cleaning, contingencies). A payment that would exceed a category's limit is rejected by the contract.
- **Approved vendors only.** Money can only go to vendors the assembly has approved.
- **Council approval.** The administrator proposes an expense with its invoice. A threshold of council members (for example 2 of 3) must approve before the payment leaves.
- **Public receipts.** Every proposal, approval and payment is recorded. Any resident opens a read-only page and sees the balance, the budget against what has been spent, and who approved each payment, with no account needed.
- **History belongs to the building.** When the administrator or the council changes, the history stays.

The goal is to replace "trust me" with "see for yourself".

## Scope of this prototype

The prototype focuses on **how money leaves** the account. Collecting fees in local currency, and verifying that an invoice reflects a real expense, are out of scope and are described in [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md).

## Documentation

Start with [docs/README.md](docs/README.md). Recommended reading order: idea, vision, product and flows, contract design.

| Document | Purpose |
|----------|---------|
| [docs/00-idea.md](docs/00-idea.md) | The idea in plain terms |
| [docs/01-vision.md](docs/01-vision.md) | Problem, solution, value, why Stellar, business model |
| [docs/02-product-and-flows.md](docs/02-product-and-flows.md) | Actors, concepts, flows and screens |
| [docs/03-contract-design.md](docs/03-contract-design.md) | Contract state, entry points, rules, errors, tests |
| [docs/04-architecture-and-stack.md](docs/04-architecture-and-stack.md) | Components, stack and repository structure |
| [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md) | Known limits, risks and common objections |
| [docs/06-getting-started.md](docs/06-getting-started.md) | Build, test and deploy your own copy on testnet |
| [docs/07-design-system.md](docs/07-design-system.md) | Visual direction, palette, components and the landing page |
| [CHANGELOG.md](CHANGELOG.md) | Current state and history of changes |
| [docs/decisions/](docs/decisions/README.md) | Design decisions and their rationale |

## Repository layout

```
docs/          product, design and architecture documents
contracts/     Soroban treasury contract (Rust)
frontend/      web app (Next.js, TypeScript): landing page, the treasury app at /app, the manual at /hiw and tests
scripts/       deployment and demo data, not built yet
```

## Quick start

You only need [Rust](https://rustup.rs) and the [Stellar CLI](https://developers.stellar.org/docs/tools/cli) to build and test the contract. No network or accounts are involved.

```
git clone https://github.com/ErickGS28/quintti.git
cd quintti
cargo test
stellar contract build
```

The web app foundation is tested the same way, from `frontend/` (Node 22.12 or newer):

```
cd frontend
npm install
npm run lint && npm run typecheck && npm test && npm run build
```

To deploy your own copy on testnet and run a full expense (budget, vendor, deposit, proposal, two council approvals, payment, and a rejected payment), follow [docs/06-getting-started.md](docs/06-getting-started.md). The current state of the project is in [CHANGELOG.md](CHANGELOG.md).

The contract is `contracts/treasury/`. Its rules, entry points, errors and tests are described in [docs/03-contract-design.md](docs/03-contract-design.md). Versions used: `soroban-sdk` 29.0.1, Rust 1.99.1, Stellar CLI 30.0.1.

A development deployment used to exercise the full cycle from the command line. It will be replaced by the demo deployment, and the testnet is reset periodically, so treat this address as temporary.

| | |
|---|---|
| Network | Stellar testnet |
| Contract | `CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA` ([stellar.expert](https://stellar.expert/explorer/testnet/contract/CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA)) |
| Token | Native XLM through its Stellar Asset Contract, `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Council | 3 members, threshold 2 |

Verified on testnet: setting a budget and an approved vendor, a deposit, a proposal, one approval that leaves the expense pending, a second approval that pays the vendor, and two rejections (a proposal above the category limit fails with error 12, and a non-council approval fails with error 15). The transactions are linked from the explorer page of the contract.

## Name

Quintti comes from the Quechua *qinti*, hummingbird: small, fast and precise. See [docs/decisions/0001-name.md](docs/decisions/0001-name.md).

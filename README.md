# Quintti

A shared treasury for residential buildings, with the assembly's rules built into the account. Built on Stellar and Soroban.

> **Status:** hackathon prototype for Código Cordillera (BAF × Stellar). The treasury contract is implemented and tested; the web app is not built yet. Testnet only, unaudited, not for real funds.

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
| [docs/decisions/](docs/decisions/README.md) | Design decisions and their rationale |

## Repository layout

```
docs/          product, design and architecture documents
contracts/     Soroban treasury contract (Rust)
frontend/      web app (Next.js, TypeScript), not built yet
scripts/       deployment and demo data, not built yet
```

## Build and test the contract

Requirements: Rust (the toolchain and the `wasm32v1-none` target are set by `rust-toolchain.toml`) and the [Stellar CLI](https://developers.stellar.org/docs/tools/cli).

```
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
stellar contract build
```

The contract is `contracts/treasury/`. Its rules, entry points, errors and tests are described in [docs/03-contract-design.md](docs/03-contract-design.md). Versions used: `soroban-sdk` 29.0.1, Rust 1.99.1, Stellar CLI 30.0.1.

This README is updated with run instructions for the web app and the deployed contract address when they exist.

## Name

Quintti comes from the Quechua *qinti*, hummingbird: small, fast and precise. See [docs/decisions/0001-name.md](docs/decisions/0001-name.md).

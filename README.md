# Quintti

[![CI](https://github.com/ErickGS28/quintti/actions/workflows/ci.yml/badge.svg)](https://github.com/ErickGS28/quintti/actions/workflows/ci.yml)

A shared treasury for residential buildings, with the assembly's rules built into the account. Built on Stellar and Soroban.

> **Status:** hackathon prototype for Código Cordillera (BAF × Stellar). The treasury contract is implemented and tested. The web app has the landing page and the treasury app: overview, expenses (propose, approve, cancel, check the invoice) and rules (budget and vendors), with Stellar Wallets Kit for signing, a hidden manual at `/hiw` and a hidden page with the business model and the plan at `/negocio`. A browser wallet has signed a full cycle on testnet and the demo deployment, with its transactions, is linked below. Testnet only, unaudited, not for real funds.

## Ship It: what we launch on 27 November

We are taking Quintti from a hackathon demo to something anyone can open, check and build on. By 27 November 2026 we will ship, on Stellar testnet:

- **A public demo.** The web app as a static site that reads the live demo treasury, so anyone can see the balance, the budget against what was spent, and who approved each payment, with no account.
- **Continuous integration.** Every push to main runs the contract tests, format and lint checks, and the web app's lint, types, tests and build.
- **A design for a collective assembly.** Today the assembly is one account, the main limit listed in [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md). We will write the decision record for replacing it with a collective mechanism (multi-signature of owners' representatives or an on-chain vote) and a delay on council rotation.
- **A two-minute demo walkthrough** of a full expense: propose, two council approvals, payment on stellar.expert.

Still testnet only and unaudited: nothing here handles real funds.
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
| [docs/08-demo-walkthrough.md](docs/08-demo-walkthrough.md) | A two-minute walk through one full expense |
| [docs/09-state-and-next-steps.md](docs/09-state-and-next-steps.md) | Where we are, the gaps between code and demo, and what comes next |
| [docs/10-mainnet-launch.md](docs/10-mainnet-launch.md) | Putting a treasury on mainnet as an unaudited beta, step by step |
| [docs/11-shipit-mainnet-plan.md](docs/11-shipit-mainnet-plan.md) | The plan to launch on mainnet for the Ship It challenge only. Optional, not decided |
| [docs/12-buildings-and-links.md](docs/12-buildings-and-links.md) | How a building is created, shared and opened, with no server |
| [CHANGELOG.md](CHANGELOG.md) | Current state and history of changes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branches, commit style and the checks to run before pushing |
| [docs/decisions/](docs/decisions/README.md) | Design decisions and their rationale |

## Repository layout

```
docs/          product, design and architecture documents
contracts/     Soroban treasury contract (Rust)
frontend/      web app (Next.js, TypeScript): landing page, the treasury app at /app, the manual at /hiw, the business model and plan at /negocio, and tests
scripts/       deploys a treasury with your own roles (deploy-treasury.ps1, a dry run unless -Execute), seeds the demo treasury on testnet (seed-demo.ps1), shows a 2-of-3 multi-signature assembly (demo-multisig-assembly.ps1) and holds the demo invoices
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

The demo deployment, created by [scripts/seed-demo.ps1](scripts/seed-demo.ps1) (it can be rerun at any time to start from the same state; the testnet is reset periodically, so treat the address as temporary).

| | |
|---|---|
| Network | Stellar testnet |
| Contract | `CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP` ([stellar.expert](https://stellar.expert/explorer/testnet/contract/CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP)) |
| Token | Native XLM through its Stellar Asset Contract, `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Council | 3 members, threshold 2 |
| Budget | mantenimiento 1,000 XLM, vigilancia 600 XLM, aseo 300 XLM |

Transactions of the seed run, each visible in stellar.expert:

| Step | Transaction |
|------|-------------|
| Deploy | [03e11f5f…0530](https://stellar.expert/explorer/testnet/tx/03e11f5f49611b9c8e7e68d0cb9fb1bfbdc19735d18d35ba65b9aa605f9e0530) |
| Budget mantenimiento | [9361d7db…9375](https://stellar.expert/explorer/testnet/tx/9361d7db5824cb824b0e5cfcb599dd8ba50725321b18d0fc64a4f80594559375) |
| Budget vigilancia | [701459d7…cf77](https://stellar.expert/explorer/testnet/tx/701459d78dc25335b6f0b6e398b96a366e52842dd9c6e9d310a312bfeec6cf77) |
| Budget aseo | [254455ff…dc6a](https://stellar.expert/explorer/testnet/tx/254455ff8346549f0b638ae619fedc3bc2996ff547920b42cab035b177eedc6a) |
| Vendor approved | [34c45cb3…6b3e](https://stellar.expert/explorer/testnet/tx/34c45cb3bd00504c51fdf6cf789c2c28ec117a52b56ff304696dc49974c76b3e) |
| Deposit 500 XLM | [ff584659…bc5f](https://stellar.expert/explorer/testnet/tx/ff584659c483df8e40fab2277facb6a90da701e06a8778fcda1211ef1662bc5f) |
| Propose 80 XLM | [6d21bb77…4fa1](https://stellar.expert/explorer/testnet/tx/6d21bb77ccf7658c574692afd885971c102cf61e832a3626811a634ad30f4fa1) |
| First approval (pending) | [d2fa7f3a…8b96](https://stellar.expert/explorer/testnet/tx/d2fa7f3aabfca44b524c12a06ba5ae0fce756af1e480fd97c34d5bec11dc8b96) |
| Second approval (pays the vendor) | [f6e28a19…cdc4](https://stellar.expert/explorer/testnet/tx/f6e28a19669b798a93ce20fbbe8db0f7c98f8c97604668b20bdb2a468a20cdc4) |

After the run the expense is `Paid`, the budget shows 80 of 1,000 XLM spent and the treasury holds 420 XLM. Verified on testnet in the earlier development deployment: a proposal above the category limit fails with error 12, and an approval by a non-council account fails with error 15. The demo invoices used by the seed and the recording are in [scripts/demo/](scripts/demo/).
## Name

Quintti comes from the Quechua *qinti*, hummingbird: small, fast and precise. See [docs/decisions/0001-name.md](docs/decisions/0001-name.md).

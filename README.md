# Quintti

A shared treasury for residential buildings, with the assembly's rules built into the account. Built on Stellar and Soroban.

> **Status:** hackathon prototype for Código Cordillera (BAF × Stellar). The treasury contract is implemented and tested. The web app has the landing page and the treasury app: overview, expenses (propose, approve, cancel, check the invoice) and rules (budget and vendors), with Stellar Wallets Kit for signing, and a hidden manual at `/hiw`. A browser wallet has signed a full cycle on testnet and the demo deployment, with its transactions, is linked below. Testnet only, unaudited, not for real funds.

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

The demo deployment, created by [scripts/seed-demo.ps1](scripts/seed-demo.ps1) (it can be rerun at any time to start from the same state; the testnet is reset periodically, so treat the address as temporary).

| | |
|---|---|
| Network | Stellar testnet |
| Contract | `CA67PF3REYJWLXK7WE2OKEJMX42A76LCUQWL4PAU2TV2IRO5BSFLWZKR` ([stellar.expert](https://stellar.expert/explorer/testnet/contract/CA67PF3REYJWLXK7WE2OKEJMX42A76LCUQWL4PAU2TV2IRO5BSFLWZKR)) |
| Token | Native XLM through its Stellar Asset Contract, `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Council | 3 members, threshold 2 |
| Budget | mantenimiento 1,000 XLM, vigilancia 600 XLM, aseo 300 XLM |

Transactions of the seed run, each visible in stellar.expert:

| Step | Transaction |
|------|-------------|
| Deploy | [2d5ab488…0135](https://stellar.expert/explorer/testnet/tx/2d5ab488c72d07e4c2ae13bb78c799c042eed2a46b23e8b266ea2907ff310135) |
| Budget mantenimiento | [135c8fd5…b15d](https://stellar.expert/explorer/testnet/tx/135c8fd56c1802c088ecc14e4d09dd5568cd76ed1d967afe3a2e71c7fac5b15d) |
| Budget vigilancia | [49f0263a…585e](https://stellar.expert/explorer/testnet/tx/49f0263a8c45cd7b1aabdf25cb7a94e43a4c0e7d3ca50bac7b7709430c01585e) |
| Budget aseo | [26a29b23…b63c](https://stellar.expert/explorer/testnet/tx/26a29b23de98f97208696ca0f1b55065143d02043f38a5852b06b69c7f9ab63c) |
| Vendor approved | [95f898b5…58d5](https://stellar.expert/explorer/testnet/tx/95f898b557c09cbadc1ab4d1eb8bb27e09ce2fce95694481fb3991d1e54c58d5) |
| Deposit 500 XLM | [15a10853…a33b](https://stellar.expert/explorer/testnet/tx/15a108532fd4f3b6cb182a4edaabdd0019fcbbce3eb6ff50b3e08072fd8aa33b) |
| Propose 80 XLM | [3c199115…08dc](https://stellar.expert/explorer/testnet/tx/3c19911529c35a90fd48dc48f87e8b0b6977d9a82b0e2ba8bad0dfe1103708dc) |
| First approval (pending) | [0fe281d1…4591](https://stellar.expert/explorer/testnet/tx/0fe281d162545a410c2e4477d689634e678408c0947991fe01db5a8aea814591) |
| Second approval (pays the vendor) | [9ca8ed13…8166](https://stellar.expert/explorer/testnet/tx/9ca8ed136a9c246831204a6f8a554fd109c0c8537eddd9a94305efe7c78e8166) |

After the run the expense is `Paid`, the budget shows 80 of 1,000 XLM spent and the treasury holds 420 XLM. Verified on testnet in the earlier development deployment: a proposal above the category limit fails with error 12, and an approval by a non-council account fails with error 15. The demo invoices used by the seed and the recording are in [scripts/demo/](scripts/demo/).
## Name

Quintti comes from the Quechua *qinti*, hummingbird: small, fast and precise. See [docs/decisions/0001-name.md](docs/decisions/0001-name.md).

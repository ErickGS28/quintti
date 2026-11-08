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
| Contract | `CA7DWVPW2JWFZ7KSVGLCLFDXD7HZOY7HL7274UZW4ZQZBJCQSHQ4U237` ([stellar.expert](https://stellar.expert/explorer/testnet/contract/CA7DWVPW2JWFZ7KSVGLCLFDXD7HZOY7HL7274UZW4ZQZBJCQSHQ4U237)) |
| Token | Native XLM through its Stellar Asset Contract, `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Council | 3 members, threshold 2 |
| Budget | mantenimiento 1,000 XLM, vigilancia 600 XLM, aseo 300 XLM |

Transactions of the seed run, each visible in stellar.expert:

| Step | Transaction |
|------|-------------|
| Deploy | [ab48707d…86d1](https://stellar.expert/explorer/testnet/tx/ab48707d996b0c3b22e28e70800219c463dd1a6feefa2817179ac3f42be386d1) |
| Budget mantenimiento | [be6dfba2…6a1e](https://stellar.expert/explorer/testnet/tx/be6dfba2889bf6e57cd369937bf08cf2c1384272f003dc00cd85d5e85a5a6a1e) |
| Budget vigilancia | [4b9495ac…5e49](https://stellar.expert/explorer/testnet/tx/4b9495acd2761ff6fd994f3121203ad07f031d7358554ab91b64002652c05e49) |
| Budget aseo | [3981954f…54fc](https://stellar.expert/explorer/testnet/tx/3981954f87d7d4a5b776a15ee1b9f501c21828b64b3d1259c9bab159ae8154fc) |
| Vendor approved | [16fc71b6…a95d](https://stellar.expert/explorer/testnet/tx/16fc71b693566f6005e9ee41c68b5e77577bd7be2bab27af2152c4d2cb57a95d) |
| Deposit 500 XLM | [4f785889…742e](https://stellar.expert/explorer/testnet/tx/4f7858899c1c83108c557a970b808a7d6968d326f20a07c8a5589f85c306742e) |
| Propose 80 XLM | [c4ad95b2…9a1f](https://stellar.expert/explorer/testnet/tx/c4ad95b256ba8d5a440b833be8f9132e60e9ac8575999dac52201ff5bf9d9a1f) |
| First approval (pending) | [12d354e9…789e](https://stellar.expert/explorer/testnet/tx/12d354e9da289c2f102388b31dccf33590e0975a2687436439fa959c5887789e) |
| Second approval (pays the vendor) | [c51aedbb…11c2](https://stellar.expert/explorer/testnet/tx/c51aedbb571f58ea2383f6cf37596c4ff27e48f7ae609ad7ca630288843811c2) |

After the run the expense is `Paid`, the budget shows 80 of 1,000 XLM spent and the treasury holds 420 XLM. Verified on testnet in the earlier development deployment: a proposal above the category limit fails with error 12, and an approval by a non-council account fails with error 15. The demo invoices used by the seed and the recording are in [scripts/demo/](scripts/demo/).
## Name

Quintti comes from the Quechua *qinti*, hummingbird: small, fast and precise. See [docs/decisions/0001-name.md](docs/decisions/0001-name.md).

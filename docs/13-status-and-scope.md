# 13. Status and scope

A snapshot of Quintti on **26 November 2026**, written for someone who has to decide whether it is worth funding and who should be able to check every claim. It says what exists, how each part was verified, what does not exist, and what a "semi-stable beta" does and does not promise.

For the open work, in order, see [09-state-and-next-steps.md](09-state-and-next-steps.md). For how it works inside, [03-contract-design.md](03-contract-design.md) and [04-architecture-and-stack.md](04-architecture-and-stack.md).

## What Quintti is

A shared treasury for a residential building, on Stellar. A Soroban contract holds the building's money and refuses to pay outside the assembly's rules: a budget per category, approved vendors only, and a threshold of the council's approvals. Every proposal, approval and payment is recorded, and any resident can read it from a link, with no account.

The problem it addresses, in the words of the product: the money belongs to everyone and control belongs to very few. The claim "residents want this" is a **hypothesis that has not been validated with real users** ([05-risks-and-limits.md](05-risks-and-limits.md)).

## What "semi-stable beta" means here

| It does promise | It does not promise |
|-----------------|---------------------|
| The contract and the app are tested, the tests run on every push, and the main branch is green | That the contract is free of bugs. It has **not been audited** |
| The product works end to end on **Stellar testnet** and can be tried by anyone from a link | That it should hold real money. Testnet coins have no value. Mainnet exists only as an opt-in, unaudited beta that has not been deployed |
| Every part is documented, with the reasons for each decision, so work can resume without the people who wrote it | That a real building has used it. **Nobody outside the team has** |
| The contract has no way to move money outside its rules, and says so in its tests | That it follows Colombian condominium law. That has **not been reviewed** |

## What is built, and how it was checked

| Capability | What it does | How it was verified |
|------------|--------------|---------------------|
| **Rules enforced by the contract** | Budget per category, approved vendors, an approval threshold, no payment to the assembly, the administrator or a council member | 109 contract tests. Rejections seen on testnet: a proposal over the limit fails with error 12, an approval by a non-member with error 15 |
| **Council approval pays** | The approval that reaches the threshold pays the vendor in the same transaction | A full cycle (connect, propose, approve, pay) was signed on testnet with a browser wallet (Freighter), on an earlier deployment ([CHANGELOG.md](../CHANGELOG.md)). The current demo has a paid expense, seeded by `scripts/seed-demo.ps1` |
| **Public view** | Balance, budget against spent, each expense with who approved it, and a check of an invoice's fingerprint in the browser | Seen in a browser against the live demo treasury. Needs no wallet |
| **Building name and the words of an expense** | The name, a required description and an optional invoice link live on-chain, so no database is needed (a server with a database was built and dropped, see [decisions/0014](decisions/0014-no-offchain-records-in-the-demo.md)) | Contract tests, and read back from the live demo |
| **Several buildings with no server** | A building is chosen by the link, `/app/?edificio=C...`. A building opened from a link is read-only until the person saves it | Seen in a browser on testnet with two buildings ([decisions/0019](decisions/0019-buildings-by-link-without-a-backend.md), [12-buildings-and-links.md](12-buildings-and-links.md)) |
| **Deposits from the app** | Any wallet can pay into a saved building. The form checks the payer's balance before asking for a signature | A real deposit of 1 XLM moved a building from 0 to 10,000,000 stroops, signed with a key held in memory. **Not tried with a browser wallet extension** ([decisions/0020](decisions/0020-deposits-and-errors-from-other-contracts.md)) |
| **Errors are blamed on the right contract** | A deposit that the token rejects is not shown as a treasury rule | Found by measuring testnet. The tests fail when the check is removed |
| **A collective assembly** | A 2-of-3 Stellar multi-signature account can be the assembly, and council rotation can be made to wait ([decisions/0017](decisions/0017-a-collective-assembly.md)) | On testnet, `scripts/demo-multisig-assembly.ps1`: one signature is refused by the network and two are accepted. Announcing, executing and cancelling a rotation each succeeded with two signatures. **Only a script can do it; the app cannot** |
| **Deployment for a building** | `scripts/deploy-treasury.ps1` deploys a treasury with the roles you give it. It only shows the plan unless told to execute | Run on testnet. Its validations were tried against bad input |
| **Quality gates** | Format and lint for the contract, lint, types and build for the app, 308 app tests, CI on `main`, `dev` and `shipit` | Green on the latest commit of all three branches |

Size at this date: about 1,150 lines of contract code and 1,880 of contract tests; a contract that compiles to 27 KB; 20 written design decisions; 106 commits by two authors, 33 of them since 8 November, after the hackathon.

## What does not exist

Nothing below is hidden; each is a limit of the product today.

- **Collecting fees from residents.** A resident cannot pay a fee in pesos. Bringing local money on-chain needs a regulated anchor, to be verified per provider. Without it, Quintti covers how money **leaves** the account ([decisions/0003](decisions/0003-spending-side-first.md)).
- **Paying vendors in pesos.** A vendor receives tokens at a Stellar address and must convert them to cash on their own.
- **A building created from the browser.** Creating one is a command-line step.
- **The multi-signature assembly inside the app.** The app signs with one wallet, so a building whose assembly is a 2-of-3 account cannot change its rules from the app.
- **A shared directory of buildings.** Each person keeps their own list in their browser, because there is no server.
- **Notifications.** Nobody is told when a building needs a signature.
- **Proof that an invoice is real.** The fingerprint proves a file was not swapped. It does not prove the service was delivered or the price was fair.
- **An audit, a legal review and a real pilot.**

## The honest weak points

1. **No one outside the team has used it.** Adoption is the main risk, and the interviews that would test it are not done. The administrator, who would have to adopt it, is the person being watched.
2. **The contract cannot be upgraded.** A bug means a new deployment and a migration. That is deliberate, so that nobody changes the rules under the residents, but it raises the cost of a mistake.
3. **The assembly is the root of trust.** With one account, whoever controls it can rewrite the rules. A multi-signature account removes the single person, and the delay on council rotation gives residents time to see a change coming. Budget and vendor changes are still immediate.
4. **The error codes for a token's failures were observed, not specified.** They hold for XLM's token on testnet. Another token may number them differently, and the app then shows a general message.
5. **The deployed demo site may be behind the code.** The testnet site was built from older code until it is rebuilt ([09-state-and-next-steps.md](09-state-and-next-steps.md)).

## How to check it yourself

Everything runs on testnet and costs nothing.

1. **Read the record.** The demo treasury is `CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP`, and the README lists the transactions of its setup. The testnet is reset periodically, so an address can disappear. The scripts recreate it.
2. **Run the tests.** `cargo test` (109) and, from `frontend/`, `npm install` then `npm test` (308). They need no network and no account.
3. **Open the app.** `npm run dev` in `frontend/`, then `/app/`. The manual at `/hiw` explains each role.
4. **Try the rules.** Follow [06-getting-started.md](06-getting-started.md) to deploy your own copy and see a proposal above the limit refused.
5. **See the collective assembly.** `./scripts/demo-multisig-assembly.ps1` creates a 2-of-3 account, deploys a treasury with it and shows one signature refused and two accepted.

## What this beta is for

To be put in front of a real administrator and council, **in shadow mode**: their real expenses and invoices replayed on testnet, with no real money, to find out whether the flow fits how a building decides. The work that makes that possible, and that a funded sprint would do, is listed in [09-state-and-next-steps.md](09-state-and-next-steps.md): the multi-signature assembly in the app, creating a building from the browser, and the pilot itself.

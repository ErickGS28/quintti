# 9. Where we are and what comes next

Updated on 26 November 2026 so the work can resume without the conversation that produced it. [CHANGELOG.md](../CHANGELOG.md) has the history, [13-status-and-scope.md](13-status-and-scope.md) says what the product is today and how each claim was checked, and this document has what is open.

## State

| Area | State |
|------|-------|
| Contract | 109 unit tests, fmt and clippy clean. Rules, council approval, handover, a delay on council rotation ([0017](decisions/0017-a-collective-assembly.md)), the building's name and a description and invoice link on every expense, all on-chain |
| Collective assembly | A 2-of-3 Stellar multi-signature account works as the assembly. Shown on testnet by `scripts/demo-multisig-assembly.ps1`. Not wired into the web app |
| Web app | Landing, `/app` (Resumen, Gastos, Reglas, and Mis edificios from the building card), `/hiw`, `/negocio`. 308 offline tests. Static export, hosted on Netlify |
| Deposits | A **Depositar** screen at `/app/depositar` ([0020](decisions/0020-deposits-and-errors-from-other-contracts.md)). Any wallet, no role, only on a saved building. A deposit was made for real on testnet with a key in memory, moving a treasury from 0 to 1 XLM. **Not tried with a browser wallet extension** |
| Several buildings | A building is chosen by the link, `/app/?edificio=C...`, with a list kept in the browser and no backend. A building opened from a link is read-only until it is saved ([0019](decisions/0019-buildings-by-link-without-a-backend.md), [12-buildings-and-links.md](12-buildings-and-links.md)). Seen working in a browser on testnet with two buildings |
| Demo treasury | `CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP`, the current interface, seeded by `scripts/seed-demo.ps1`. A second one, `CC2NVO7Z4BVRTHJG34EDFF5JLHBBRJXKOLUYVUL5DFGO4RA7D5VS4I52` ("Conjunto Pirámide"), has no data and serves to try switching buildings. The testnet is reset periodically |
| Mainnet | The web app can be built for mainnet as an unaudited beta ([0018](decisions/0018-mainnet-as-an-opt-in-beta.md)), and `scripts/deploy-treasury.ps1` deploys with your own roles. Nothing is deployed there. Guide: [10-mainnet-launch.md](10-mainnet-launch.md). A plan to launch for the Ship It challenge only, undecided, is in [11-shipit-mainnet-plan.md](11-shipit-mainnet-plan.md); it is not part of the roadmap below |
| Repository | `main`, `dev` and `shipit` are on the same commit and the CI is green on all three. Branch rules in [CONTRIBUTING.md](../CONTRIBUTING.md). `shipit` is deleted after 27 November. **No licence yet** |
| Audit, legal review, pilot, fee collection | None |

## Gaps between the code and what is deployed

None of these breaks the running demo.

1. **The Netlify demo site was built from older code.** It points at the previous treasury and has the previous interface. Rebuilding it picks up the current code and `NEXT_PUBLIC_TREASURY_CONTRACT_ID` from the environment. The Netlify address is not in the README yet (step 2 of the next session).
2. **The app offers no council rotation.** [0016](decisions/0016-a-smaller-app.md) removed those forms. The contract and the hooks support them.
3. **The multi-signature assembly only exists as a script.** The app signs with one wallet, so a building whose assembly is a 2-of-3 account cannot change its rules from the app.
4. **A building is created from the command line.** `scripts/deploy-treasury.ps1` is the only way ([12-buildings-and-links.md](12-buildings-and-links.md)).
5. **Fee collection is not built.** The app has a deposit screen ([decisions/0020](decisions/0020-deposits-and-errors-from-other-contracts.md)), but a resident cannot pay a fee in pesos: money still has to reach a wallet before it can be deposited.
6. **The deposit screen was never clicked with a real wallet.** The signing path was checked with a key in memory, and the screens and locks in a browser without a wallet. Try it once with Freighter on testnet.
7. **Three live tests fail against a seeded treasury.** They expect an English category and a variable that the seed does not set. They are opt-in (`QUINTTI_LIVE=1`) and the reason is written at the top of the file.

The demo treasury should keep a **single-account assembly** while item 3 stands.
## Next session

The first things to do, in this order. The first four need no one but whoever is at the keyboard.

1. **Try the deposit with a real wallet.** Freighter on testnet, on the overview of the demo building: connect, **Depositar fondos**, pay 1 XLM, see the balance change. It is the one path of the current work never clicked with a wallet extension ([decisions/0020](decisions/0020-deposits-and-errors-from-other-contracts.md)).
2. **Rebuild and republish the testnet site.** The site on Netlify was built from older code and points at the previous treasury. Rebuild it from `main` with `NEXT_PUBLIC_TREASURY_CONTRACT_ID` set to the current demo, upload it, and put its address in the README, which does not list it yet.
3. **Choose a licence.** The repository has none (GitHub reports no licence), so by default nobody may reuse it. This is a decision for the owners, and a funder will look for it.
4. **Re-read the two-minute walkthrough** ([08-demo-walkthrough.md](08-demo-walkthrough.md)) against the current app: it predates the deposit, the building name and the buildings screen. It is the text for the Ship It demo mission.
5. **Decide about mainnet.** Only if the challenge's closing mission needs it. The plan is in [11-shipit-mainnet-plan.md](11-shipit-mainnet-plan.md); it needs real XLM, a funded deploy key, an RPC provider and the owner's confirmation, and it can be skipped with nothing lost.
6. **Fill in and send the funding application.** The draft answers are in `hack/pitch/instaward-sow-borrador.md`, outside the repository. They need the figures only the team knows (people, dates, the wallet and the amount).

## What comes next

After that, in the order that matters for the funded sprint. Each one lists what it depends on.

1. **Create a building from the browser.** Today it is a command-line step. It depends on whether Stellar Wallets Kit can sign the transaction that deploys a contract (*to verify*, and it is the first thing to try). If it cannot, the fallback is a short guided command.
2. **The multi-signature assembly inside the app.** Only a script can use it today. The app would build the rule-changing transaction with the assembly account as its source, let each representative sign it in turn with their wallet, and send it once the threshold is met. Whether the kit can pass one transaction between signers is *to verify*. This turns [0017](decisions/0017-a-collective-assembly.md) from a script into a product.
3. **A pilot in shadow mode.** One or two buildings, or a property management company, replaying real expenses on testnet with their invoices and approvals. A letter of intent is the deliverable, and the interviews in `hack/validation/` (outside the repository) are the evidence. This is the main open risk: nobody outside the team has used Quintti. It does not depend on items 1 and 2, and it can start before them.
4. **A way for fees to arrive.** An anchor for Colombian pesos, to verify per provider. Without it the product covers only how money leaves ([0003](decisions/0003-spending-side-first.md)). It depends on a third party, so it is validated before it is built.
5. **A way for vendors to cash out.** A vendor receives tokens and must turn them into pesos. Without a path for that, many will not accept them.
6. **Notifications.** Nobody is told when a building needs a signature. A link shared by a messaging app is the only channel today.
7. **Decide whether budget and vendor changes also need a delay.** [0017](decisions/0017-a-collective-assembly.md) leaves them immediate and says why.
8. **Weighted votes (option B of 0017)**, once the legal question of how an assembly decides has an answer.
9. **An audit** before any real value, and a legal review of whether on-chain approvals count under Law 675 of 2001.
## Open questions

- How a real assembly appoints and replaces its signers.
- How long the rotation delay should be in a real building.
- Where the invoice files live, beyond their fingerprint on-chain.
- Whether the name and the domain are free to use.
- Which anchor and payment rail fit fee collection in Colombia.

## Working notes

- Branches, commits and checks: [CONTRIBUTING.md](../CONTRIBUTING.md).
- Testnet identities (`qt-admin`, `qt-assembly`, `qt-council1..3`, `qt-vendor`, and for the multi-signature demo `qt-rep1..3` and `qt-assembly-ms`) live in the Stellar CLI on the developer's machine, not in the repository. They are throwaway keys with no value.
- The testnet is reset periodically. Every address in the documents can disappear. The seed script and the multi-signature script recreate them.
- On Windows PowerShell 5.1, avoid `Get-Content`/`Set-Content` on files with accents. The CLI writes its progress to stderr, which PowerShell reports as an error even when the command succeeded.

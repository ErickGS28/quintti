# 9. Where we are and what comes next

Written on 25 November 2026 so the work can resume without the conversation that produced it. [CHANGELOG.md](../CHANGELOG.md) has the history; this document has what is open.

## State

| Area | State |
|------|-------|
| Contract | 95 unit tests, fmt and clippy clean. Rules, council approval, handover, and a delay on council rotation ([0017](decisions/0017-a-collective-assembly.md)) |
| Collective assembly | A 2-of-3 Stellar multi-signature account works as the assembly. Shown on testnet by `scripts/demo-multisig-assembly.ps1`. Not wired into the web app |
| Web app | Landing, `/app` (Resumen, Gastos, Reglas), `/hiw`, `/negocio`. 240 offline tests. Static export, hosted on Netlify |
| Demo treasury | `CA7DWVPW2JWFZ7KSVGLCLFDXD7HZOY7HL7274UZW4ZQZBJCQSHQ4U237`, deployed before the rotation delay. It has the previous interface |
| Repository | `main` and `dev` equal, CI green on both, branch rules in [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Audit, pilot, fee collection | None |

## Gaps between the code and the demo

These exist because the contract moved ahead of what is deployed. None breaks the running demo.

1. **The demo treasury lacks the rotation functions.** The web app's generated bindings (`frontend/src/contracts/generated/`) come from that deployment, so they have none of the new functions or errors 20 to 23, and `frontend/src/copy/errors.es.ts` and `frontend/src/lib/stellar/contract-errors.ts` have no Spanish message for them.
2. **The README shows the old deployment**, its transactions and a balance that no longer matches (the contract has had three expenses since the seed).
3. **The Netlify address is not in the README.**
4. **The app offers no rotation.** [0016](decisions/0016-a-smaller-app.md) removed those forms. The contract and the hooks support them.

To close 1 and 2: deploy with `scripts/seed-demo.ps1` (it passes a rotation delay of zero, so the app behaves as before), run `npm run bindings -- <new contract id>` in `frontend/`, add the four Spanish messages, update `NEXT_PUBLIC_TREASURY_CONTRACT_ID` in `frontend/.env.example`, the README table and the Netlify variable, then rebuild and upload the site. The demo treasury should keep a **single-account assembly**: the app signs with one wallet, so the Reglas forms would stop working with a 2-of-3 assembly.

## What comes next

In the order that matters for the Instaward sprint:

1. **The multi-signature assembly inside the app.** Today only a script can use it. The app would build the rule-changing transaction with the assembly account as its source, let each representative sign it in turn with their wallet, and send it once the threshold is met. Whether Stellar Wallets Kit can pass the same transaction between signers is *to verify*. This turns [0017](decisions/0017-a-collective-assembly.md) from a script into a product.
2. **A pilot in shadow mode.** One or two buildings, or a property management company, replaying real expenses on testnet with their invoices and approvals. A letter of intent is the deliverable, and the interviews in `hack/validation/` (outside the repository) are the evidence. This is the main open risk: nobody outside the team has used Quintti.
3. **A way for fees to arrive.** An anchor for Colombian pesos, to verify per provider. Without it the product covers only how money leaves ([0003](decisions/0003-spending-side-first.md)).
4. **Decide whether budget and vendor changes also need a delay.** [0017](decisions/0017-a-collective-assembly.md) leaves them immediate and says why.
5. **Weighted votes (option B of 0017)**, once the legal question of how an assembly decides has an answer.
6. **An audit** before any real value, and a legal review of whether on-chain approvals count under Law 675 of 2001.

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

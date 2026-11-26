# 8. Two-minute demo walkthrough

A short walk through one full expense, for a video or a live demo. Everything runs on Stellar testnet with no real money. The longer five-minute version adds the landing page and the business model; this one is only the product.

## Before you start

- The app running (`npm run dev` in `frontend/`, or the hosted static site) and pointed at a seeded treasury. The demo deployment is in the [README](../README.md); run `scripts/seed-demo.ps1` for a fresh one.
- A browser wallet (Freighter or another supported by Stellar Wallets Kit) on testnet, with three accounts imported: the **administrator** and two **council members**. See [06-getting-started.md](06-getting-started.md) and the manual at `/hiw`.
- The demo invoices from `scripts/demo/` ready to pick: the original and the modified one.
- Do one full run first. Each run spends budget and leaves an expense in the list, so numbers on screen will differ from this text. Read them from the screen.

## The walk

| Time | Where | What to do | What to say |
|------|-------|-----------|-------------|
| 0:00 | `/app`, no wallet | Show Balance, Budget used and Signatures needed (for example 2 of 3) | "Any resident sees this with no account. The money, the budget and who must approve." |
| 0:20 | An existing paid expense | Open it. Point at the approvals and the invoice fingerprint | "Every payment keeps who approved it and the fingerprint of its invoice." |
| 0:35 | Same expense | Drop the original invoice, then the modified one | "The original matches. Change one number and it no longer does." |
| 0:50 | Wallet: administrator, then Gastos, Proponer gasto | Pick a category, the approved vendor, and an amount above what is available | "The account itself refuses it. The administrator cannot spend past what the assembly approved." |
| 1:05 | Same form | Lower the amount, attach the invoice, propose and sign | "Within the budget, to an approved vendor, with its invoice. Now it waits for the council." |
| 1:25 | Wallet: council member 1, open the new expense | Approve and sign | "One signature is not enough. It stays pending." |
| 1:40 | Wallet: council member 2 | Approve and sign. The expense turns Paid | "The second signature reaches the threshold and the payment leaves in the same transaction." |
| 1:50 | Open the transaction in stellar.expert | Show the successful contract call and the transfer to the vendor | "It is on a public network. Anyone can check it, and nobody can change it afterwards." |

Close in one sentence: "Quintti puts the assembly's rules inside the account, so residents see for themselves where their fee goes."

## If something goes wrong

| What you see | What to do |
|--------------|-----------|
| The wallet is on another network | Switch it to testnet and reload |
| "No role" after connecting | The active wallet account is not the administrator or a council member. Switch and reconnect |
| The Approve button is missing | You are on another account, or you already signed |
| The expense does not turn Paid | Wait about ten seconds or reload. The signature is already on-chain |

## What the demo does not show

The fee collection in local currency, a collective assembly and the real validity of an invoice are not part of the prototype. They are described in [05-risks-and-limits.md](05-risks-and-limits.md) and [decisions/0017](decisions/0017-a-collective-assembly.md).

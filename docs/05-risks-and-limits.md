# 5. Risks and limits

Honesty about limits is part of the product. This document lists what Quintti does not do, what could go wrong, and how to answer the obvious objections.

## What is real and what is simulated in the prototype

| Real (on Stellar testnet) | Simulated or trusted |
|---------------------------|----------------------|
| The treasury contract holding a token balance | The token is a testnet asset with no real value |
| Budget limits, approved vendors and the approval threshold enforced by the contract | The assembly is one account standing in for a real collective decision |
| Wallet signatures for proposals and approvals | Some demo signers are throwaway testnet keys |
| Public receipts readable by anyone | Residents' fee payments. The treasury is funded directly |
| Transactions visible in stellar.expert | Conversion between local currency and the token |

## Known limits

- **Descriptions and invoice files live off-chain.** They are in Supabase, written by the app's server. An invoice is accepted only if it matches the fingerprint on-chain, and details are written once, but the description is written by whoever first uploads the right file, in practice the administrator. If the database is lost, the treasury and its history stay intact on-chain; only the words and files are gone. See [decisions/0013](decisions/0013-offchain-records-in-supabase.md).

- **The invoice can be false.** The fingerprint proves the file was not swapped afterwards. It does not prove the service was delivered or the price was fair. People still check that.
- **Fee collection is not built.** Residents pay in local currency. Bringing that money on-chain needs an anchor, which is a next step.
- **The council can collude.** With a threshold of 2 of 3, two members who agree can approve a bad expense. The protection is that it is recorded and visible, plus the budget and vendor limits.
- **The assembly role is the root of trust.** Whoever controls it can add vendors, change the budget, and rotate the council to their own addresses. In the prototype it is a single account. A production version needs a collective mechanism, for example a multi-signature account of owners' representatives or an on-chain vote. A time delay on council rotation is a possible mitigation. See [decisions/0004](decisions/0004-assembly-role.md).
- **No upgrade path.** A bug means a new deployment and a migration. This is deliberate: nobody can change the rules under the residents.
- **Lost keys.** If council members lose access, the assembly can rotate the council. If the assembly loses its key, the rules cannot change. Key recovery for the assembly is an open design question.
- **Unaudited.** The contract has not been audited and must not hold real value.
- **Privacy.** Everything is public by design. Vendor addresses and amounts are visible to anyone. Residents' personal data is never stored on-chain.
- **Legal validity is not established.** Whether an on-chain approval satisfies a country's condominium law (in Colombia, Law 675 of 2001) has not been checked. This is not legal advice.

## Product risks

| Risk | Why it matters | Mitigation |
|------|----------------|------------|
| Administrators do not want transparency | The buyer may be the person being watched | Position it as protection for honest administrators. Target management companies that want to prove their work |
| Councils do not want to sign with a wallet | Adoption friction | Wallet abstraction with passkeys is a later step. The prototype uses standard wallets |
| Problem is felt less than assumed | The pains are hypotheses | Interviews with administrators and residents before claiming otherwise |
| Business model does not add up at small scale | About 1 USD per unit per month needs hundreds of buildings | Start with a pilot and management companies |
| Fee collection depends on third parties | Anchors vary by country and change | Validate with each anchor before promising it |

## Common objections

**"Why not a spreadsheet or a shared bank account?"**
A spreadsheet is edited by whoever holds it. A joint bank account gives the council control but residents see nothing, and the rules (budget, vendors) are not enforced by the account. Here the account refuses to pay outside the rules, and everyone sees the same record.

**"Why not a native multi-signature account?"**
Native multi-signature enforces who signs, not what is signed. It cannot enforce a budget per category or a vendor list. See [decisions/0002](decisions/0002-contract-holds-the-funds.md).

**"There are other transparent treasuries on Stellar."**
Treasury and transparency tools exist, mostly aimed at organizations in general. Quintti is specific to the rules of a residential building: category budgets approved by the assembly, approved vendors, separation between administrator and council, and handover between administrators, with a public view for residents.

**"What if the council and the administrator collude?"**
They can approve a bad expense within the budget and vendor limits. Every step is public, and the damage is bounded by the category limit.

**"Who is the assembly on-chain?"**
Today, one account. This is the most important simplification in the prototype and it is stated openly.

**"Why Stellar?"**
Dollar stablecoin payments settle in seconds with minimal fees, local payment rails are reachable through anchors, and Soroban lets the rules live in the account holding the money. Not every part needs a blockchain. The part that does is making rules unbreakable and the record public without trusting the provider.

**"Is this legal?"**
It is a transparency and internal-control tool. It does not replace the assembly or the law, and its legal standing is to be reviewed per country before any pilot.

## Open questions

- How a real assembly acts on-chain (multi-signature of representatives, on-chain vote, or another mechanism).
- Where invoice files are stored so a resident can retrieve them, beyond the fingerprint on-chain.
- Which anchor and payment rail fits fee collection in Colombia.
- Whether on-chain approvals are valid under local condominium law.

Each one becomes a file in [decisions/](decisions/README.md) when it is resolved.

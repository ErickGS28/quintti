# 1. Vision

## Problem

A building's fee is a shared fund managed by one person, with oversight that is slow, periodic and mostly paper-based. The weak point is not that administrators are dishonest. It is that **nothing in the system makes honesty visible or dishonesty hard**:

- Control happens after the money has moved, not before.
- The rules the assembly approves (budget, vendors) are not enforced anywhere. They live in minutes and memory.
- Transparency depends on the goodwill of whoever administers.
- History belongs to the person, not to the building.

Details and examples: [00-idea.md](00-idea.md). All pains listed there are hypotheses until they are checked with administrators and residents.

## Solution

Quintti is a treasury account whose spending rules are enforced by a smart contract:

| Rule | Who sets it | Who it constrains |
|------|-------------|-------------------|
| Budget limit per category | Assembly | Everyone. A payment that exceeds the limit is rejected |
| Approved vendors | Assembly | Everyone. Money cannot go to an address that is not on the list |
| Approval threshold (for example 2 of 3) | Assembly | Administrator. A proposal pays only after enough council members sign |
| Separation of duties | Contract | The administrator cannot also be a council member, so nobody approves their own proposal |

Every proposal, approval and payment is recorded on a public ledger that residents read without an account.

## Value

**From "trust me" to "see for yourself".**

- **Trust that can be checked.** Transparency becomes a property of the account, not a favour.
- **Rules that apply themselves.** The approved budget stops being a suggestion: the account does not execute what exceeds it.
- **Less conflict.** Questions stop being accusations. Assemblies can discuss decisions, not suspicions.
- **Protection for whoever administers well.** A public record with several signatures is the best defence against an unfair accusation.
- **The history belongs to the building.** Changing administrator does not erase memory.

## Why Stellar and not a web2 product

| A web2 product or a shared spreadsheet | With Stellar and Soroban |
|----------------------------------------|--------------------------|
| The software company stores the data and can change it. Residents must trust it. | A public record that nobody can alter, including us. A resident or an auditor verifies it without asking for access. |
| The administrator moves money from the bank with one person. | The rules live in the account that holds the money. Without the council's signatures and within the budget, the payment does not leave. |
| A management app shows numbers while the money sits somewhere else. | Money and rules are in the same place, so what is shown is what happened. |
| A bank's joint signature feature gives the council control, but residents see nothing. | Residents, council and assembly see the same thing at the same time. |
| Owners abroad pay with slow, expensive transfers. | Payments settle in seconds with minimal fees, from any country, using a dollar stablecoin. |
| Fees make small payments expensive to record. | A transaction costs a fraction of a cent, so recording a 10 dollar expense is viable. |

Stellar primitives used: Soroban smart contracts for the rules, address authorization for council signatures, the Stellar Asset Contract for a stablecoin (USDC), and wallet signing for every action. A native multi-signature account alone could not enforce budgets or vendor lists, which is why the rules live in a contract ([decisions/0002](decisions/0002-contract-holds-the-funds.md)).

### Honest comparison

A business bank account with joint signatures already offers part of this. What it does not offer is a view for every resident, rules the bank itself cannot bypass or edit, and a record that survives a change of provider. The advantage is transparency and enforcement, not cheaper banking.

### What Stellar does not solve

- **An invoice can be false.** The prototype stores the document's digital fingerprint so nobody can swap it later. It does not prove the expense happened. People still verify that, with better information.
- **Residents pay in local currency.** Converting between pesos and a dollar stablecoin depends on external services (anchors). The prototype focuses on how money leaves, not how it arrives.
- **The council can collude.** With 2 of 3 signatures, two council members who agree can approve a bad expense. What changes is that it is recorded and visible to everyone.
- **The assembly is the root of trust.** Whoever controls the assembly role can change the rules. See [decisions/0004](decisions/0004-assembly-role.md).
- **It is a transparency and internal-control tool.** It does not replace the assembly or the law.

## Business model

Principle: Quintti never holds or moves the building's funds. It charges for the tool, not for the money.

Hypotheses, ordered from most to least realistic. None of the figures is validated:

1. **Subscription per unit.** A small monthly amount per apartment, paid from the building's budget. Illustrative: about 1 USD per unit per month would be about 40 USD per month for a 40-unit building.
2. **Property management companies.** Companies that administer many buildings are the natural customer: one contract, dozens of buildings, and a clear argument ("prove your management").
3. **Extra services.** Reports ready for the assembly, resident notifications, and history migration when the administrator changes.

Costs are low: network fees are fractions of a cent and there are no offices or appraisers. The large costs when growing are support and contract audits.

With about 1 USD per unit per month, hundreds of buildings are needed for a sustainable business. The realistic path is a pilot in one building with a willing administrator, then growth by referral.

## Next steps after the hackathon

- Pilot in one real building.
- Fee collection through a local anchor (see [05-risks-and-limits.md](05-risks-and-limits.md)).
- Contract audit before holding real value.
- Funding options such as the Stellar Community Fund (confirm each program's details before citing it).

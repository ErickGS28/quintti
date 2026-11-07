# 0. The idea

## In one sentence

Quintti is the building's shared account where the administrator cannot spend outside the assembly's rules, and every resident can see where their fee goes.

## The pain

Residents of a building under a condominium regime pay a monthly fee. That money pays for security, cleaning, elevators, repairs and a contingency reserve. It belongs to everyone, but it is controlled by one person, watched by a small council and an assembly that meets once or twice a year.

Typical situations (hypotheses to validate with interviews, not measured data):

- **"Where did my fee go?"** The accounts arrive weeks later as a PDF or a spreadsheet that nobody can cross-check. Asking feels like accusing.
- **The administrator pays at their own discretion.** Nothing prevents hiring an acquaintance, overpaying, or paying without comparing quotes. The council finds out after the fact.
- **The approved budget is only a recommendation.** The assembly approves an amount for maintenance, but nothing stops spending more, or spending it on something else.
- **The contingency reserve runs on trust.** It exists on paper, and who uses it and when depends on a single signature.
- **The history is lost when the administrator changes.** The new one receives boxes, files and distrust.
- **Residents cannot look without asking permission.**

The result is distrust between neighbours, assemblies that end in fights, and honest administrators who have no way to prove they are honest.

## The idea

Put the assembly's rules inside the account that holds the money:

1. The assembly loads the approved budget as limits per category and approves a list of vendors.
2. The administrator proposes an expense with its invoice.
3. The account checks the rules. The vendor must be approved and the amount must fit the category's remaining budget.
4. The council approves. When enough members have signed (for example 2 of 3), the payment goes directly to the vendor.
5. Every step leaves a public record. Any resident can open a link and see it.

## A simple example

**Torres del Parque, 40 apartments** (a fictional building used for the demo).

1. The assembly approved 10 million pesos for maintenance this year.
2. The elevator breaks. Marta, the administrator, proposes paying the technician 8 million, attaching the invoice.
3. The technician is on the approved list and 8 million fits the budget, so the proposal goes to the council.
4. Two of three council members sign. The payment goes to the technician.
5. A month later another repair of 5 million appears in the same category. The account rejects it: it would exceed the limit. Only the assembly can raise the budget, and the change is recorded.
6. Don Pedro, from apartment 302, opens the link on his phone and sees both movements, the invoices and the approvals.

## Who it is for

| Who | What they get |
|-----|---------------|
| Resident | Sees where the fee goes, without asking permission or waiting for the assembly |
| Honest administrator | Can prove it. Every expense has its record and its approvals |
| Council | Stops being a rubber stamp. Nothing leaves without its signatures, and the assembly's rules apply by themselves |
| Next administrator | Inherits the building's complete history |

## The goal of the prototype

Show end to end, on Stellar testnet, that rules agreed by an assembly can be enforced by the account itself:

- an expense that respects the rules is proposed, approved by the council and paid;
- an expense that breaks the rules is rejected by the contract;
- a resident verifies everything from a read-only page.

Why this matters and why Stellar: [01-vision.md](01-vision.md).

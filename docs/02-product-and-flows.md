# 2. Product and flows

## Actors

| Actor | On-chain identity | Can do | Cannot do |
|-------|-------------------|--------|-----------|
| **Assembly** | One address (the *assembly role*) | Set budget limits, approve vendors, rotate council and administrator, cancel a pending expense | Move funds. Approve an expense |
| **Administrator** | One address | Propose expenses, cancel pending expenses | Approve expenses. Change rules. Move funds alone |
| **Council member** | One address each (3 to 7) | Approve a pending expense | Propose expenses. Change rules |
| **Vendor** | An address on the approved list | Receive payments | Anything else. It has no role in the contract |
| **Resident** | None needed | Read everything from a public page | Change anything |

The administrator and the council members must be different addresses (separation of duties).

In the prototype the assembly is represented by one account. How a real assembly would act on-chain is an open question documented in [05-risks-and-limits.md](05-risks-and-limits.md) and [decisions/0004](decisions/0004-assembly-role.md).

## Concepts

| Concept | Meaning |
|---------|---------|
| **Treasury** | The contract instance for one building. It holds the funds as a token balance |
| **Budget line** | A category (for example `maintenance`) with an annual limit and the amount already spent |
| **Approved vendor** | An address the assembly allows to receive payments |
| **Expense** | A proposed payment: category, vendor, amount, invoice fingerprint |
| **Invoice fingerprint** | The SHA-256 hash of the invoice file, computed in the browser and stored with the expense |
| **Threshold** | Number of council approvals needed to pay (for example 2 of 3) |
| **Receipt** | The public record of an expense: who proposed, who approved, when, and the payment transaction |

An expense moves through these states:

```
Pending ──(approvals reach threshold, rules still hold)──► Paid
   │
   └──(administrator or assembly cancels)──────────────────► Cancelled
```

`Paid` and `Cancelled` are final.

## Flows

### 1. Set up the building (assembly)

1. Deploy the treasury with the token, the assembly address, the administrator, the council and the threshold.
2. Load the budget lines (category and limit).
3. Approve vendors.

### 2. Fund the treasury

Fees arrive as token transfers to the treasury address. In the prototype the demo funds it directly with testnet tokens. Collecting fees from residents is out of scope.

### 3. Spend (happy path)

1. The administrator proposes an expense: category, vendor, amount and the invoice file. The browser computes the invoice fingerprint.
2. The contract validates: amount greater than zero, known category, approved vendor, and the amount fits the category's remaining budget.
3. Council members approve, each signing with their own wallet.
4. The approval that reaches the threshold also executes the payment: the contract rechecks the rules, updates its state and sends the tokens to the vendor.
5. The receipt appears on the public page with a link to the transaction in the explorer.

### 4. Spending that is blocked

| Attempt | Result |
|---------|--------|
| Proposal that exceeds the category's remaining budget | Rejected at proposal time |
| Proposal to a vendor that is not approved | Rejected at proposal time |
| Approval by someone who is not on the council | Rejected |
| Second approval by the same council member | Rejected |
| Approval that would pay more than the treasury holds | Rejected. The proposal stays pending |
| Two pending proposals that together exceed the budget | The second one fails when its approval would pay. The administrator cancels it or the assembly raises the limit |

### 5. Handover

1. The assembly sets a new administrator, or rotates the council and the threshold.
2. The history stays in the contract. Pending expenses remain pending. Approvals from former council members stop counting.

### 6. Resident view

A resident opens the public link and sees, without any account:

- the treasury balance;
- each category: limit, spent and remaining;
- the list of expenses with state, amount, vendor, who proposed and who approved;
- a link to each payment in the explorer;
- an invoice check: dropping the invoice file shows whether it matches the stored fingerprint.

## Screens (functional description)

The visual design is pending (see [README](README.md)). This section describes content and behaviour only.

| Screen | Audience | Content and actions |
|--------|----------|---------------------|
| **Public view** | Anyone | Balance, budget lines, expense list, invoice check, active network |
| **Council panel** | Administrator, council | Connect wallet. Propose an expense (administrator). Approve a pending expense (council). Transaction status |
| **Assembly panel** | Assembly | Edit budget lines, approved vendors, council and threshold, administrator |
| **Setup / demo** | Team | Seeded demo accounts and a reset, for the demonstration only |

Required states in every async view: loading, empty, error with retry, pending transaction, success with explorer link, wallet disconnected, wrong network.

## Out of scope for the prototype

- Collecting fees from residents and per-unit accounting.
- Fiat on-ramp and off-ramp.
- Checking that an invoice reflects a real expense.
- Votes by individual residents.
- Public delinquency lists by name (privacy concern).
- A token, or any yield on the funds.
- Changing the contract after deployment (no upgrade path).

# 3. Contract design

Design status: **proposed**. It is finalized in the contract's first implementation phase, and this document is updated in the same change as the code. Everything that depends on SDK or network behaviour is marked *to verify*.

One contract instance serves one building. Structure follows `toolkit/playbooks/contract.md`.

## Principles

1. The contract holds the funds as a token balance. The only way out is an expense that satisfies every rule ([decisions/0002](decisions/0002-contract-holds-the-funds.md)).
2. No single actor can move funds. Paying requires a proposal by the administrator plus approvals from a threshold of council members, and the rules must hold.
3. The assembly role changes rules, never moves funds ([decisions/0004](decisions/0004-assembly-role.md)).
4. State is updated before tokens are transferred.
5. Amounts are integers in the token's base units (`i128`). Never floats.
6. No upgrade path. A new version is a new deployment.

## State

### Instance storage (small, read on almost every call)

| Key | Type | Meaning |
|-----|------|---------|
| `Config` | struct | `token`, `assembly`, `administrator`, `threshold` |
| `Council` | `Vec<Address>` | Current council members (3 to `MAX_COUNCIL`) |
| `Categories` | `Vec<Symbol>` | Known budget categories (for enumeration) |
| `Vendors` | `Vec<Address>` | Approved vendors (for enumeration) |
| `ExpenseCount` | `u32` | Number of expenses created. The next id |

### Persistent storage (long-lived records)

| Key | Type | Meaning |
|-----|------|---------|
| `Budget(Symbol)` | `BudgetLine { limit: i128, spent: i128 }` | One per category |
| `Vendor(Address)` | `bool` | Whether the vendor is currently approved |
| `Expense(u32)` | `Expense` | One per expense |

```
Expense {
  id: u32,
  category: Symbol,
  vendor: Address,
  amount: i128,
  invoice_hash: BytesN<32>,
  approvals: Vec<Address>,
  status: Pending | Paid | Cancelled,
  created_at: u64,        // ledger time
  paid_at: Option<u64>,
}
```

Named constants bound every collection. Initial values, to confirm when implementing: `MAX_COUNCIL = 7`, `MAX_CATEGORIES = 16`, `MAX_VENDORS = 64`, `MAX_PAGE = 20`.

TTL: persistent entries expire unless extended. Every write extends the entry it touches, and the instance entry is extended on each call. A long-running deployment also needs a keep-alive routine. *To verify:* current `extend_ttl` API and ledger limits.

## Entry points

Roles read from `Config` authorize with `require_auth()` on the stored address, so a caller cannot claim a role by passing a parameter.

| Entry point | Auth | Effect | Errors | Events |
|-------------|------|--------|--------|--------|
| `initialize(token, assembly, administrator, council, threshold)` | assembly | One-time setup | `AlreadyInitialized`, `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil` | `Initialized` |
| `set_budget(category, limit)` | assembly | Create or update a budget line. The limit cannot be below what is already spent | `InvalidAmount`, `BudgetBelowSpent`, `TooManyCategories` | `BudgetSet` |
| `set_vendor(vendor, allowed)` | assembly | Approve or remove a vendor | `TooManyVendors`, `VendorIsInsider` | `VendorSet` |
| `set_administrator(administrator)` | assembly | Replace the administrator | `AdministratorInCouncil` | `AdministratorSet` |
| `rotate_council(council, threshold)` | assembly | Replace the council and threshold | `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil` | `CouncilRotated` |
| `propose_expense(category, vendor, amount, invoice_hash) -> u32` | administrator | Create a pending expense | `InvalidAmount`, `UnknownCategory`, `VendorNotApproved`, `VendorIsInsider`, `OverBudget` | `ExpenseProposed` |
| `approve_expense(approver, id)` | approver (council member) | Record an approval. If approvals reach the threshold, pay | `NotCouncilMember`, `ExpenseNotFound`, `ExpenseNotPending`, `AlreadyApproved`, `VendorNotApproved`, `OverBudget`, `InsufficientBalance` | `ExpenseApproved`, and `ExpensePaid` when it pays |
| `cancel_expense(caller, id)` | administrator or assembly | Move a pending expense to cancelled | `NotAuthorized`, `ExpenseNotFound`, `ExpenseNotPending` | `ExpenseCancelled` |

### Reads (no auth)

`get_config`, `get_council`, `list_categories`, `get_budget(category)`, `list_vendors`, `is_vendor(address)`, `expense_count`, `get_expense(id)`, `get_expenses(from, limit)` (page size capped by `MAX_PAGE`), `balance` (token balance of the contract).

### Optional (should)

`deposit(from, amount)`: transfers tokens from a payer to the treasury and emits an event, so the public page can show who paid in. Without it, funds arrive as plain token transfers.

## Rules

### On proposal

- `amount > 0`.
- The category exists.
- The vendor is approved and is not the administrator or a council member (`VendorIsInsider`, a self-dealing guard).
- `spent + amount <= limit` for the category. Early feedback to the administrator.

### On the approval that reaches the threshold

The approval count only includes addresses that are **currently** on the council, so approvals from removed members stop counting. When it reaches the threshold, the contract rechecks everything, because things may have changed since the proposal:

1. The vendor is still approved.
2. `spent + amount <= limit`. This check is authoritative.
3. The treasury balance covers the amount.
4. **Effects first:** `spent += amount`, status becomes `Paid`, `paid_at` is set.
5. **Then the transfer** from the contract to the vendor.
6. Emit `ExpensePaid`.

If any check fails, the whole transaction reverts, including the approval that was being recorded. The proposal remains pending until it is cancelled or the cause is fixed (for example the assembly raises the limit).

### Governance

- `rotate_council` and `set_administrator` validate separation of duties again.
- Council size is between 1 and `MAX_COUNCIL`, with no duplicates. `1 <= threshold <= council size`. A realistic configuration uses at least 3 members and a threshold of 2 or more.

## Invariants (must always hold)

1. Funds leave the contract only through an expense that reached the threshold and passed every rule.
2. For each category, the sum of paid expenses never exceeds the category's limit.
3. An expense is paid at most once.
4. The paid amount is always less than or equal to the treasury balance at that moment.
5. A council member is counted at most once per expense.
6. The administrator is never a council member.
7. Money only goes to approved vendors.
8. The assembly role has no entry point that transfers funds.

## Errors

Typed with `#[contracterror]` and stable numeric values.

`AlreadyInitialized`, `NotInitialized`, `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil`, `InvalidAmount`, `UnknownCategory`, `TooManyCategories`, `TooManyVendors`, `BudgetBelowSpent`, `VendorNotApproved`, `VendorIsInsider`, `OverBudget`, `ExpenseNotFound`, `ExpenseNotPending`, `NotCouncilMember`, `AlreadyApproved`, `NotAuthorized`, `InsufficientBalance`.

## Events

Emitted for every state change a client must observe: `Initialized`, `BudgetSet`, `VendorSet`, `AdministratorSet`, `CouncilRotated`, `ExpenseProposed`, `ExpenseApproved`, `ExpensePaid`, `ExpenseCancelled`. Each includes the expense id or the affected address where relevant.

The public page reads **state**, not events, to rebuild the history. *To verify:* RPC event retention is limited, so events are for live updates and explorers, not for long-term history.

## Failure modes considered

| Case | Handling |
|------|----------|
| Zero or negative amount | `InvalidAmount` |
| Same council member approves twice | `AlreadyApproved` |
| Approval after the expense was paid or cancelled | `ExpenseNotPending` |
| Vendor removed after the proposal | Rechecked at execution: `VendorNotApproved` |
| Budget lowered below spent | `BudgetBelowSpent` |
| Two pending proposals that exceed the budget together | The authoritative check at execution rejects the second |
| Council rotated while an expense is pending | Only current members' approvals count |
| Token transfer fails | The transaction reverts, including the state change |
| Collections growing without bound | Capped by named constants |
| Expired persistent entry | TTL extended on write. Keep-alive routine for long deployments |

## Tests

Named by behaviour, in `test.rs`. Required cases:

- initialization validates council, threshold and separation of duties, and cannot run twice;
- a proposal is rejected for an unapproved vendor, an insider vendor, an unknown category, a zero amount, and an amount over budget;
- a single approval does not pay; reaching the threshold pays exactly once and updates `spent`;
- a duplicate approval, a non-council approval, and an approval of a paid or cancelled expense are rejected;
- an approval that would pay more than the balance is rejected and leaves state unchanged;
- a budget cannot be set below what is already spent;
- after a council rotation, approvals from removed members do not count;
- cancelling works for the administrator and the assembly, and not for anyone else;
- fund conservation: treasury balance plus total paid equals total received after every scenario;
- authorization is verified, not only mocked: calls without the right signer fail.

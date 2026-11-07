# 3. Contract design

Design status: **implemented and tested** in `contracts/treasury/` (78 unit tests). It is not deployed or audited. Items that depend on network behaviour are marked *to verify*.

One contract instance serves one building. Structure follows `toolkit/playbooks/contract.md`.

## Principles

1. The contract holds the funds as a token balance. The only way out is an expense that satisfies every rule ([decisions/0002](decisions/0002-contract-holds-the-funds.md)).
2. No single actor can move funds. Paying requires a proposal by the administrator plus approvals from a threshold of council members, and the rules must hold.
3. The assembly role changes rules, never moves funds ([decisions/0004](decisions/0004-assembly-role.md)).
4. State is updated before tokens are transferred.
5. Amounts are integers in the token's base units (`i128`). Never floats.
6. No upgrade path. A new version is a new deployment.

## Source layout

```
contracts/treasury/src/
  lib.rs        entry points: authorize → validate → logic → persist → transfer → event
  types.rs      data types, storage keys and the bounds (MAX_COUNCIL, MAX_CATEGORIES, MAX_VENDORS, MAX_PAGE)
  errors.rs     the Error enum with stable numeric values
  events.rs     one event per state change
  storage.rs    typed reads and writes, and TTL extension
  logic.rs      pure rules: governance validation, budget arithmetic, vendors, approval counting
  payment.rs    the only place where funds leave the contract
  test/         unit tests split by capability, with shared setup
```

## State

### Instance storage (small, bounded, read on almost every call)

| Key | Type | Meaning |
|-----|------|---------|
| `Config` | `Config` | `token`, `assembly`, `administrator`, `threshold` |
| `Council` | `Vec<Address>` | Current council members (1 to `MAX_COUNCIL`) |
| `Categories` | `Vec<Symbol>` | Budget categories, in creation order |
| `ExpenseCount` | `u32` | Number of expenses proposed. The next id |

The token and the assembly never change. The assembly can replace the administrator and the council with its threshold.

### Persistent storage (long-lived records)

| Key | Type | Meaning |
|-----|------|---------|
| `Budget(Symbol)` | `BudgetLine { limit: i128, spent: i128 }` | One per category |
| `Vendors` | `Vec<Address>` | Approved vendors, at most `MAX_VENDORS`, in one entry |
| `Expense(u32)` | `Expense` | One per expense |

```
Expense {
  id: u32,
  category: Symbol,
  vendor: Address,
  amount: i128,
  invoice_hash: BytesN<32>,
  approvals: Vec<Address>,   // in order; removed members stop counting
  status: Pending | Paid | Cancelled,
  created_at: u64,           // ledger time
  paid_at: Option<u64>,
}
```

Bounds: `MAX_COUNCIL = 7`, `MAX_CATEGORIES = 16`, `MAX_VENDORS = 64`, `MAX_PAGE = 20`.

TTL: every state-changing call extends the instance entry and the persistent entries it writes. An entry is extended to about 30 days when less than 7 days remain (ledgers close about every 5 seconds). Reads do not extend. A deployment that stays idle for a long time needs a keep-alive transaction. *To verify:* current ledger limits for entry lifetime.

## Entry points

Roles read from `Config` authorize with `require_auth()` on the stored address, so a caller cannot claim a role by passing a parameter.

| Entry point | Auth | Effect | Errors | Events |
|-------------|------|--------|--------|--------|
| `__constructor(token, assembly, administrator, council, threshold)` | none (runs once at deployment) | Fixes the rules | `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil` | `Initialized` |
| `set_budget(category, limit)` | assembly | Create or update a budget line. The limit must be positive and not below what is spent | `InvalidAmount`, `BudgetBelowSpent`, `TooManyCategories` | `BudgetSet` |
| `set_vendor(vendor, allowed)` | assembly | Approve or remove a vendor. Idempotent | `VendorIsInsider`, `TooManyVendors` | `VendorSet` |
| `set_administrator(administrator)` | assembly | Replace the administrator | `AdministratorInCouncil` | `AdministratorSet` |
| `rotate_council(council, threshold)` | assembly | Replace the council and threshold | `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil` | `CouncilRotated` |
| `propose_expense(category, vendor, amount, invoice_hash) -> u32` | administrator | Create a pending expense | `InvalidAmount`, `UnknownCategory`, `VendorNotApproved`, `VendorIsInsider`, `OverBudget`, `Overflow` | `ExpenseProposed` |
| `approve_expense(approver, id)` | approver (council member) | Record an approval. If the approvals reach the threshold, pay | `NotCouncilMember`, `ExpenseNotFound`, `ExpenseNotPending`, `AlreadyApproved`, and when paying `VendorNotApproved`, `VendorIsInsider`, `UnknownCategory`, `OverBudget`, `Overflow`, `InsufficientBalance` | `ExpenseApproved`, and `ExpensePaid` when it pays |
| `cancel_expense(caller, id)` | administrator or assembly | Move a pending expense to cancelled | `NotAuthorized`, `ExpenseNotFound`, `ExpenseNotPending` | `ExpenseCancelled` |
| `deposit(from, amount)` | payer | Transfer tokens into the treasury and record who paid | `InvalidAmount` | `Deposited` |

A plain token transfer to the contract address also funds the treasury, but leaves no record in the contract.

### Reads (no auth)

`get_config`, `get_council`, `list_categories`, `get_budget(category) -> Option<BudgetLine>`, `list_vendors`, `is_vendor(address)`, `expense_count`, `get_expense(id)`, `get_expenses(from, limit)` (page size capped by `MAX_PAGE`, in id order), `balance` (token balance of the contract).

## Rules

### On proposal

- `amount > 0`.
- The category exists.
- The vendor is approved and is **not** the assembly, the administrator or a council member (`VendorIsInsider`, a self-dealing guard).
- `spent + amount <= limit` for the category. Early feedback to the administrator.

### On the approval that reaches the threshold

The approval count only includes addresses that are **currently** on the council, so approvals from removed members stop counting. When it reaches the threshold, `payment::execute` rechecks everything, because things may have changed since the proposal:

1. The vendor is still approved and is still not an insider.
2. `spent + amount <= limit`, using checked arithmetic. This check is authoritative.
3. The treasury balance covers the amount.
4. **Effects first:** `spent += amount`, status becomes `Paid`, `paid_at` is set, and both are stored.
5. **Then the transfer** from the contract to the vendor.
6. Emit `ExpensePaid`.

If any check fails, the whole transaction reverts, including the approval that was being recorded. The proposal remains pending until it is cancelled or the cause is fixed (for example the assembly raises the limit).

### Governance

- `rotate_council` and `set_administrator` run the same validation as the constructor: council size between 1 and `MAX_COUNCIL`, no duplicates, `1 <= threshold <= council size`, and the administrator is not a council member. A realistic configuration uses at least 3 members and a threshold of 2 or more.
- The administrator can be replaced by someone who is currently an approved vendor. Such a vendor can no longer be paid, because the insider check runs again at payment.

## Invariants

1. Funds leave the contract only through an expense that reached the threshold and passed every rule.
2. For each category, the sum of paid expenses never exceeds the category's limit.
3. An expense is paid at most once.
4. The paid amount is always less than or equal to the treasury balance at that moment.
5. A council member is counted at most once per expense.
6. The administrator is never a council member.
7. Money only goes to approved vendors that are not insiders.
8. The assembly role has no entry point that transfers funds.

## Errors

Typed with `#[contracterror]`. The numeric values are part of the interface and stay stable once deployed.

| # | Error | Meaning |
|---|-------|---------|
| 1 | `NotInitialized` | The configuration is missing from storage |
| 2 | `InvalidCouncil` | Empty, too large or duplicated council |
| 3 | `InvalidThreshold` | Zero, or larger than the council |
| 4 | `AdministratorInCouncil` | The administrator is also a council member |
| 5 | `InvalidAmount` | Zero or negative amount, or limit |
| 6 | `UnknownCategory` | The category has no budget line |
| 7 | `TooManyCategories` | `MAX_CATEGORIES` reached |
| 8 | `TooManyVendors` | `MAX_VENDORS` reached |
| 9 | `BudgetBelowSpent` | New limit below what is already paid |
| 10 | `VendorNotApproved` | The vendor is not on the list |
| 11 | `VendorIsInsider` | The vendor is the assembly, the administrator or a council member |
| 12 | `OverBudget` | The expense would exceed the category limit |
| 13 | `ExpenseNotFound` | No expense with that id |
| 14 | `ExpenseNotPending` | Already paid or cancelled |
| 15 | `NotCouncilMember` | The approver is not on the council |
| 16 | `AlreadyApproved` | That member already approved |
| 17 | `NotAuthorized` | The caller may not do this |
| 18 | `InsufficientBalance` | The treasury cannot cover the payment |
| 19 | `Overflow` | A checked arithmetic operation overflowed |

## Events

One event per state change, so clients can follow the treasury: `Initialized`, `BudgetSet`, `VendorSet`, `AdministratorSet`, `CouncilRotated`, `ExpenseProposed`, `ExpenseApproved`, `ExpensePaid`, `ExpenseCancelled`, `Deposited`. The expense id, the category or the address is a topic, so it can be indexed.

The public view reads **state**, not events, to rebuild the history. *To verify:* RPC event retention is limited, so events are for live updates and explorers, not for long-term history.

## Failure modes considered

| Case | Handling |
|------|----------|
| Zero or negative amount | `InvalidAmount` |
| Same council member approves twice | `AlreadyApproved` |
| Approval after the expense was paid or cancelled | `ExpenseNotPending` |
| Vendor removed after the proposal | Rechecked at payment: `VendorNotApproved` |
| Vendor becomes an insider after the proposal | Rechecked at payment: `VendorIsInsider` |
| Budget lowered below spent | `BudgetBelowSpent` |
| Two pending proposals that exceed the budget together | The check at payment rejects the second |
| Council rotated while an expense is pending | Only current members' approvals count |
| Token transfer fails | The transaction reverts, including the state change |
| Spent total would overflow `i128` | `Overflow` |
| Collections growing without bound | Capped by named constants |
| Expired persistent entry | TTL extended on write. Keep-alive for idle deployments |

## Tests

78 unit tests in `contracts/treasury/src/test/`, named by behaviour and grouped by capability: initialization, budget, vendors, proposals, approvals, cancellation, handover, deposits and invariants. They cover the happy path, every error variant, boundaries, repeated calls and the authorization of every privileged entry point, checked both by inspecting which address is asked to sign and by calling without any mocked authorization. Invariant tests check that funds are conserved and that a category never pays beyond its limit.

Not covered yet: fuzzing and property-based tests, and the behaviour of persistent entries when they expire.

## Versions

Checked on 7 November 2026: `soroban-sdk` 29.0.1 (pinned), Rust 1.99.1, Stellar CLI 30.0.1, and the public testnet at protocol 30.

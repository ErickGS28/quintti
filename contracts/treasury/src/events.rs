//! Events for every state change a client must observe.

use soroban_sdk::{contractevent, Address, BytesN, Symbol, Vec};

/// Published once, when the contract is deployed.
#[contractevent]
pub struct Initialized {
    #[topic]
    pub assembly: Address,
    pub token: Address,
    pub administrator: Address,
    pub council: Vec<Address>,
    pub threshold: u32,
}

/// A budget line was created or its limit changed.
#[contractevent]
pub struct BudgetSet {
    #[topic]
    pub category: Symbol,
    pub limit: i128,
}

/// A vendor was approved or removed.
#[contractevent]
pub struct VendorSet {
    #[topic]
    pub vendor: Address,
    pub allowed: bool,
}

/// The administrator proposed an expense.
#[contractevent]
pub struct ExpenseProposed {
    #[topic]
    pub id: u32,
    pub category: Symbol,
    pub vendor: Address,
    pub amount: i128,
    pub invoice_hash: BytesN<32>,
}

/// A council member approved an expense. `approvals` counts the current
/// council members who have approved so far.
#[contractevent]
pub struct ExpenseApproved {
    #[topic]
    pub id: u32,
    pub approver: Address,
    pub approvals: u32,
}

/// An expense reached the threshold and the vendor was paid.
#[contractevent]
pub struct ExpensePaid {
    #[topic]
    pub id: u32,
    pub vendor: Address,
    pub amount: i128,
}

/// A pending expense was cancelled.
#[contractevent]
pub struct ExpenseCancelled {
    #[topic]
    pub id: u32,
    pub cancelled_by: Address,
}

/// The assembly replaced the administrator.
#[contractevent]
pub struct AdministratorSet {
    #[topic]
    pub administrator: Address,
}

/// The assembly replaced the council and the approval threshold.
#[contractevent]
pub struct CouncilRotated {
    pub council: Vec<Address>,
    pub threshold: u32,
}

/// Someone paid tokens into the treasury through `deposit`.
#[contractevent]
pub struct Deposited {
    #[topic]
    pub from: Address,
    pub amount: i128,
}

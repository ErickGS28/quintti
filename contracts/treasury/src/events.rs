//! Events for every state change a client must observe.

use soroban_sdk::{contractevent, Address, Symbol, Vec};

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

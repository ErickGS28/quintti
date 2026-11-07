//! Events for every state change a client must observe.

use soroban_sdk::{contractevent, Address, Vec};

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

//! Events for every state change a client must observe.

use soroban_sdk::{contractevent, Address};

/// An account presented the right code and received its share.
#[contractevent]
pub struct Claimed {
    #[topic]
    pub claimer: Address,
    pub amount: i128,
}

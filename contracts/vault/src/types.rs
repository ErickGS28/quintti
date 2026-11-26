use soroban_sdk::{contracttype, Address, BytesN};

/// Longest code the vault reads, in bytes. A longer text cannot be the code.
pub const MAX_CODE_BYTES: usize = 64;

/// What the vault was opened with. None of it changes.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    /// Token the vault holds and pays with.
    pub token: Address,
    /// SHA-256 of the code in lowercase.
    pub code_hash: BytesN<32>,
    /// What each account receives, in the token's base units.
    pub payout: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// The vault's rules (instance storage).
    Config,
    /// How many accounts have claimed (instance storage).
    Claims,
    /// Marks an account that already claimed (persistent storage).
    Claimed(Address),
}

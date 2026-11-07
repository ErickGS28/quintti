//! Typed storage access and TTL management.
//!
//! Instance storage holds the small, bounded state read on almost every call.
//! Every state-changing entry point calls `extend_instance`.

use soroban_sdk::{Address, Env, Vec};

use crate::errors::Error;
use crate::types::{Config, DataKey};

/// Ledgers close about every 5 seconds.
const LEDGERS_PER_DAY: u32 = 17_280;
/// Extend only when less than this remains.
const TTL_THRESHOLD: u32 = 7 * LEDGERS_PER_DAY;
/// Target lifetime after an extension (about 30 days).
const TTL_EXTEND_TO: u32 = 30 * LEDGERS_PER_DAY;

/// Keeps the instance entry (config, council and counters) alive.
pub fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
}

pub fn read_config(env: &Env) -> Result<Config, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Config)
        .ok_or(Error::NotInitialized)
}

pub fn write_config(env: &Env, config: &Config) {
    env.storage().instance().set(&DataKey::Config, config);
}

pub fn read_council(env: &Env) -> Vec<Address> {
    env.storage()
        .instance()
        .get(&DataKey::Council)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn write_council(env: &Env, council: &Vec<Address>) {
    env.storage().instance().set(&DataKey::Council, council);
}

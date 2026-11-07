//! Typed storage access and TTL management.
//!
//! Instance storage holds the small, bounded state read on almost every call.
//! Every state-changing entry point calls `extend_instance`.

use soroban_sdk::{Address, Env, Symbol, Vec};

use crate::errors::Error;
use crate::types::{BudgetLine, Config, DataKey};

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

/// Keeps one persistent entry alive.
fn extend_persistent(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, TTL_THRESHOLD, TTL_EXTEND_TO);
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

pub fn read_categories(env: &Env) -> Vec<Symbol> {
    env.storage()
        .instance()
        .get(&DataKey::Categories)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn write_categories(env: &Env, categories: &Vec<Symbol>) {
    env.storage()
        .instance()
        .set(&DataKey::Categories, categories);
}

pub fn read_budget(env: &Env, category: &Symbol) -> Option<BudgetLine> {
    env.storage()
        .persistent()
        .get(&DataKey::Budget(category.clone()))
}

pub fn write_budget(env: &Env, category: &Symbol, line: &BudgetLine) {
    let key = DataKey::Budget(category.clone());
    env.storage().persistent().set(&key, line);
    extend_persistent(env, &key);
}

pub fn read_vendors(env: &Env) -> Vec<Address> {
    env.storage()
        .persistent()
        .get(&DataKey::Vendors)
        .unwrap_or_else(|| Vec::new(env))
}

pub fn write_vendors(env: &Env, vendors: &Vec<Address>) {
    env.storage().persistent().set(&DataKey::Vendors, vendors);
    extend_persistent(env, &DataKey::Vendors);
}

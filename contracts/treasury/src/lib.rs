//! Quintti treasury: a shared account for one residential building.
//!
//! The contract holds the building's funds as a token balance. Money only
//! leaves through an expense that respects the assembly's rules (budget limit
//! per category, approved vendors) and reaches the council's approval
//! threshold. See `docs/03-contract-design.md`.
#![no_std]

mod errors;
mod types;

pub use errors::Error;
pub use types::{
    BudgetLine, Config, DataKey, Expense, ExpenseStatus, MAX_CATEGORIES, MAX_COUNCIL, MAX_PAGE,
    MAX_VENDORS,
};

use soroban_sdk::contract;

#[contract]
pub struct Treasury;

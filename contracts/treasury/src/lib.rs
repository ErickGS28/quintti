//! Quintti treasury: a shared account for one residential building.
//!
//! The contract holds the building's funds as a token balance. Money only
//! leaves through an expense that respects the assembly's rules (budget limit
//! per category, approved vendors) and reaches the council's approval
//! threshold. See `docs/03-contract-design.md`.
#![no_std]

use soroban_sdk::contract;

#[contract]
pub struct Treasury;

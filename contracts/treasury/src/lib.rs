//! Quintti treasury: a shared account for one residential building.
//!
//! The contract holds the building's funds as a token balance. Money only
//! leaves through an expense that respects the assembly's rules (budget limit
//! per category, approved vendors) and reaches the council's approval
//! threshold. See `docs/03-contract-design.md`.
#![no_std]

mod errors;
mod events;
mod logic;
mod storage;
mod types;

#[cfg(test)]
mod test;

pub use errors::Error;
pub use types::{
    BudgetLine, Config, DataKey, Expense, ExpenseStatus, MAX_CATEGORIES, MAX_COUNCIL, MAX_PAGE,
    MAX_VENDORS,
};

use soroban_sdk::{contract, contractimpl, token, Address, Env, Symbol, Vec};

use events::{BudgetSet, Initialized, VendorSet};

#[contract]
pub struct Treasury;

#[contractimpl]
impl Treasury {
    /// Fixes the building's rules at deployment. It runs once, atomically with
    /// the deployment, so there is no window to initialize it twice.
    ///
    /// Auth: none. Errors: `InvalidCouncil`, `InvalidThreshold`,
    /// `AdministratorInCouncil` (the deployment fails).
    pub fn __constructor(
        env: Env,
        token: Address,
        assembly: Address,
        administrator: Address,
        council: Vec<Address>,
        threshold: u32,
    ) -> Result<(), Error> {
        logic::validate_governance(&administrator, &council, threshold)?;

        storage::write_config(
            &env,
            &Config {
                token: token.clone(),
                assembly: assembly.clone(),
                administrator: administrator.clone(),
                threshold,
            },
        );
        storage::write_council(&env, &council);
        storage::extend_instance(&env);

        Initialized {
            assembly,
            token,
            administrator,
            council,
            threshold,
        }
        .publish(&env);
        Ok(())
    }

    /// Returns the fixed configuration: token, roles and threshold.
    pub fn get_config(env: Env) -> Result<Config, Error> {
        storage::read_config(&env)
    }

    /// Returns the current council members.
    pub fn get_council(env: Env) -> Vec<Address> {
        storage::read_council(&env)
    }

    /// Returns the token balance held by the treasury.
    pub fn balance(env: Env) -> Result<i128, Error> {
        let config = storage::read_config(&env)?;
        Ok(token::Client::new(&env, &config.token).balance(&env.current_contract_address()))
    }

    /// Creates a budget line or changes its limit. The limit cannot drop below
    /// what the category has already paid.
    ///
    /// Auth: assembly. Errors: `InvalidAmount`, `BudgetBelowSpent`,
    /// `TooManyCategories`.
    pub fn set_budget(env: Env, category: Symbol, limit: i128) -> Result<(), Error> {
        let config = storage::read_config(&env)?;
        config.assembly.require_auth();

        let existing = storage::read_budget(&env, &category);
        let line = logic::updated_budget(existing.as_ref(), limit)?;
        if existing.is_none() {
            let mut categories = storage::read_categories(&env);
            if categories.len() >= MAX_CATEGORIES {
                return Err(Error::TooManyCategories);
            }
            categories.push_back(category.clone());
            storage::write_categories(&env, &categories);
        }

        storage::write_budget(&env, &category, &line);
        storage::extend_instance(&env);
        BudgetSet { category, limit }.publish(&env);
        Ok(())
    }

    /// Approves or removes a vendor. Money can only be paid to approved
    /// vendors, and never to the assembly, the administrator or a council
    /// member.
    ///
    /// Auth: assembly. Errors: `VendorIsInsider`, `TooManyVendors`.
    pub fn set_vendor(env: Env, vendor: Address, allowed: bool) -> Result<(), Error> {
        let config = storage::read_config(&env)?;
        config.assembly.require_auth();

        let vendors = storage::read_vendors(&env);
        let updated = if allowed {
            let council = storage::read_council(&env);
            if logic::is_insider(&vendor, &config.assembly, &config.administrator, &council) {
                return Err(Error::VendorIsInsider);
            }
            logic::with_vendor(vendors, &vendor)?
        } else {
            logic::without_vendor(vendors, &vendor)
        };

        storage::write_vendors(&env, &updated);
        storage::extend_instance(&env);
        VendorSet { vendor, allowed }.publish(&env);
        Ok(())
    }

    /// Returns the budget categories, in creation order.
    pub fn list_categories(env: Env) -> Vec<Symbol> {
        storage::read_categories(&env)
    }

    /// Returns the limit and the amount paid for a category, if it exists.
    pub fn get_budget(env: Env, category: Symbol) -> Option<BudgetLine> {
        storage::read_budget(&env, &category)
    }

    /// Returns the approved vendors.
    pub fn list_vendors(env: Env) -> Vec<Address> {
        storage::read_vendors(&env)
    }

    /// Returns whether a vendor is currently approved.
    pub fn is_vendor(env: Env, vendor: Address) -> bool {
        storage::read_vendors(&env).contains(&vendor)
    }
}

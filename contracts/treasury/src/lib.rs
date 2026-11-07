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

use soroban_sdk::{contract, contractimpl, token, Address, Env, Vec};

use events::Initialized;

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
}

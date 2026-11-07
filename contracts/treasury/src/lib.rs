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
mod payment;
mod storage;
mod types;

#[cfg(test)]
mod test;

pub use errors::Error;
pub use types::{
    BudgetLine, Config, DataKey, Expense, ExpenseStatus, MAX_CATEGORIES, MAX_COUNCIL, MAX_PAGE,
    MAX_VENDORS,
};

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, Symbol, Vec};

use events::{BudgetSet, ExpenseApproved, ExpenseProposed, Initialized, VendorSet};

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

    /// Proposes a payment to an approved vendor, with the SHA-256 fingerprint of
    /// its invoice. Nothing is reserved: money moves only when the council
    /// approves. The proposal is rejected early if it already breaks a rule.
    ///
    /// Auth: administrator. Errors: `InvalidAmount`, `UnknownCategory`,
    /// `VendorNotApproved`, `VendorIsInsider`, `OverBudget`, `Overflow`.
    pub fn propose_expense(
        env: Env,
        category: Symbol,
        vendor: Address,
        amount: i128,
        invoice_hash: BytesN<32>,
    ) -> Result<u32, Error> {
        let config = storage::read_config(&env)?;
        config.administrator.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let line = storage::read_budget(&env, &category).ok_or(Error::UnknownCategory)?;
        if !storage::read_vendors(&env).contains(&vendor) {
            return Err(Error::VendorNotApproved);
        }
        let council = storage::read_council(&env);
        if logic::is_insider(&vendor, &config.assembly, &config.administrator, &council) {
            return Err(Error::VendorIsInsider);
        }
        logic::check_budget(&line, amount)?;

        let id = storage::read_expense_count(&env);
        let next = id.checked_add(1).ok_or(Error::Overflow)?;
        storage::write_expense(
            &env,
            &Expense {
                id,
                category: category.clone(),
                vendor: vendor.clone(),
                amount,
                invoice_hash: invoice_hash.clone(),
                approvals: Vec::new(&env),
                status: ExpenseStatus::Pending,
                created_at: env.ledger().timestamp(),
                paid_at: None,
            },
        );
        storage::write_expense_count(&env, next);
        storage::extend_instance(&env);

        ExpenseProposed {
            id,
            category,
            vendor,
            amount,
            invoice_hash,
        }
        .publish(&env);
        Ok(id)
    }

    /// Records a council member's approval. The approval that brings the number
    /// of current council members who approved to the threshold also pays the
    /// vendor, in the same transaction. If any rule fails at that moment the
    /// whole call reverts, including this approval.
    ///
    /// Auth: the approving council member. Errors: `NotCouncilMember`,
    /// `ExpenseNotFound`, `ExpenseNotPending`, `AlreadyApproved`, and when
    /// paying `VendorNotApproved`, `VendorIsInsider`, `UnknownCategory`,
    /// `OverBudget`, `InsufficientBalance`.
    pub fn approve_expense(env: Env, approver: Address, id: u32) -> Result<(), Error> {
        approver.require_auth();
        let config = storage::read_config(&env)?;
        let council = storage::read_council(&env);
        if !council.contains(&approver) {
            return Err(Error::NotCouncilMember);
        }
        let mut expense = storage::read_expense(&env, id).ok_or(Error::ExpenseNotFound)?;
        if expense.status != ExpenseStatus::Pending {
            return Err(Error::ExpenseNotPending);
        }
        if expense.approvals.contains(&approver) {
            return Err(Error::AlreadyApproved);
        }

        expense.approvals.push_back(approver.clone());
        let approvals = logic::count_valid_approvals(&expense.approvals, &council);
        ExpenseApproved {
            id,
            approver,
            approvals,
        }
        .publish(&env);

        if approvals < config.threshold {
            storage::write_expense(&env, &expense);
            storage::extend_instance(&env);
            return Ok(());
        }
        payment::execute(&env, &config, &council, expense)
    }

    /// Returns how many expenses have been proposed. Ids go from 0 to this
    /// number minus one.
    pub fn expense_count(env: Env) -> u32 {
        storage::read_expense_count(&env)
    }

    /// Returns one expense.
    ///
    /// Errors: `ExpenseNotFound`.
    pub fn get_expense(env: Env, id: u32) -> Result<Expense, Error> {
        storage::read_expense(&env, id).ok_or(Error::ExpenseNotFound)
    }

    /// Returns up to `limit` expenses starting at id `from`, in id order. The
    /// page size is capped at `MAX_PAGE`.
    pub fn get_expenses(env: Env, from: u32, limit: u32) -> Vec<Expense> {
        let count = storage::read_expense_count(&env);
        let end = from.saturating_add(limit.min(MAX_PAGE)).min(count);
        let mut page = Vec::new(&env);
        for id in from..end {
            if let Some(expense) = storage::read_expense(&env, id) {
                page.push_back(expense);
            }
        }
        page
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

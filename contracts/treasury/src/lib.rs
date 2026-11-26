//! Quintti treasury: a shared account for one residential building.
//!
//! The contract holds the building's funds as a token balance. Money only
//! leaves through an expense that respects the assembly's rules (budget limit
//! per category, approved vendors) and reaches the council's approval
//! threshold. See `docs/03-contract-design.md`.
#![no_std]
// The constructor has one argument per rule fixed at deployment. They are passed by name from the
// command line and the web app, so grouping them in a struct would make the public interface
// harder to use, not clearer. `contractimpl` also generates a wrapper outside the `impl`, which
// an attribute on the `impl` does not reach, so the allowance is for the whole crate.
#![allow(clippy::too_many_arguments)]

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
    BudgetLine, Config, DataKey, Expense, ExpenseStatus, PendingRotation, MAX_CATEGORIES,
    MAX_COUNCIL, MAX_DESCRIPTION_BYTES, MAX_NAME_BYTES, MAX_PAGE, MAX_URI_BYTES, MAX_VENDORS,
};

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, String, Symbol, Vec};

use events::{
    AdministratorSet, BudgetSet, CouncilRotated, Deposited, ExpenseApproved, ExpenseCancelled,
    ExpenseProposed, Initialized, NameSet, RotationAnnounced, RotationCancelled, VendorSet,
};

#[contract]
pub struct Treasury;

#[contractimpl]
impl Treasury {
    /// Fixes the building's rules at deployment. It runs once, atomically with
    /// the deployment, so there is no window to initialize it twice.
    ///
    /// `rotation_delay` is the waiting period in seconds between announcing a
    /// council rotation and executing it. With zero, `rotate_council` works
    /// at once. With more, the council can only change through
    /// `announce_rotation` and `execute_rotation`, so residents see the
    /// change coming.
    ///
    /// `name` is the building's name, shown to every resident. It is not
    /// empty and fits in `MAX_NAME_BYTES`.
    ///
    /// Auth: none. Errors: `InvalidCouncil`, `InvalidThreshold`,
    /// `AdministratorInCouncil`, `EmptyText`, `TextTooLong` (the
    /// deployment fails).
    pub fn __constructor(
        env: Env,
        token: Address,
        assembly: Address,
        administrator: Address,
        council: Vec<Address>,
        threshold: u32,
        rotation_delay: u64,
        name: String,
    ) -> Result<(), Error> {
        logic::validate_governance(&administrator, &council, threshold)?;
        logic::validate_text(&name, MAX_NAME_BYTES)?;

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
        storage::write_rotation_delay(&env, rotation_delay);
        storage::write_name(&env, &name);
        storage::extend_instance(&env);

        Initialized {
            assembly,
            token,
            administrator,
            council,
            threshold,
            rotation_delay,
            name,
        }
        .publish(&env);
        Ok(())
    }

    /// Returns the building's name.
    pub fn get_name(env: Env) -> String {
        storage::read_name(&env)
    }

    /// Changes the building's name, for example to fix a typo.
    ///
    /// Auth: assembly. Errors: `EmptyText`, `TextTooLong`.
    pub fn set_name(env: Env, name: String) -> Result<(), Error> {
        let config = storage::read_config(&env)?;
        config.assembly.require_auth();
        logic::validate_text(&name, MAX_NAME_BYTES)?;

        storage::write_name(&env, &name);
        storage::extend_instance(&env);
        NameSet { name }.publish(&env);
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
    /// its invoice, a description of what it is for and, optionally, a link to
    /// the invoice file (empty for none). Nothing is reserved: money moves only
    /// when the council approves. The proposal is rejected early if it already
    /// breaks a rule.
    ///
    /// Auth: administrator. Errors: `InvalidAmount`, `EmptyText`,
    /// `TextTooLong`, `UnknownCategory`, `VendorNotApproved`,
    /// `VendorIsInsider`, `OverBudget`, `Overflow`.
    pub fn propose_expense(
        env: Env,
        category: Symbol,
        vendor: Address,
        amount: i128,
        invoice_hash: BytesN<32>,
        description: String,
        invoice_uri: String,
    ) -> Result<u32, Error> {
        let config = storage::read_config(&env)?;
        config.administrator.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        logic::validate_text(&description, MAX_DESCRIPTION_BYTES)?;
        logic::validate_optional_text(&invoice_uri, MAX_URI_BYTES)?;
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
                description,
                invoice_uri,
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

    /// Cancels a pending expense, for example one that can no longer be paid.
    /// A cancelled expense is final.
    ///
    /// Auth: the administrator or the assembly. Errors: `NotAuthorized`,
    /// `ExpenseNotFound`, `ExpenseNotPending`.
    pub fn cancel_expense(env: Env, caller: Address, id: u32) -> Result<(), Error> {
        caller.require_auth();
        let config = storage::read_config(&env)?;
        if caller != config.administrator && caller != config.assembly {
            return Err(Error::NotAuthorized);
        }
        let mut expense = storage::read_expense(&env, id).ok_or(Error::ExpenseNotFound)?;
        if expense.status != ExpenseStatus::Pending {
            return Err(Error::ExpenseNotPending);
        }

        expense.status = ExpenseStatus::Cancelled;
        storage::write_expense(&env, &expense);
        storage::extend_instance(&env);
        ExpenseCancelled {
            id,
            cancelled_by: caller,
        }
        .publish(&env);
        Ok(())
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

    /// Pays tokens into the treasury and records who paid. A plain token
    /// transfer to the contract address also works, but leaves no record here.
    ///
    /// Auth: the payer. Errors: `InvalidAmount`.
    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<(), Error> {
        from.require_auth();
        let config = storage::read_config(&env)?;
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        token::Client::new(&env, &config.token).transfer(
            &from,
            env.current_contract_address(),
            &amount,
        );
        storage::extend_instance(&env);
        Deposited { from, amount }.publish(&env);
        Ok(())
    }

    /// Replaces the administrator. Pending expenses stay pending; they can be
    /// cancelled by the new administrator or the assembly.
    ///
    /// Auth: assembly. Errors: `AdministratorInCouncil`.
    pub fn set_administrator(env: Env, administrator: Address) -> Result<(), Error> {
        let mut config = storage::read_config(&env)?;
        config.assembly.require_auth();

        let council = storage::read_council(&env);
        logic::validate_governance(&administrator, &council, config.threshold)?;

        config.administrator = administrator.clone();
        storage::write_config(&env, &config);
        storage::extend_instance(&env);
        AdministratorSet { administrator }.publish(&env);
        Ok(())
    }

    /// Replaces the council and the approval threshold at once. Approvals
    /// already given by members who leave the council stop counting. Only
    /// available when the treasury was deployed without a rotation delay.
    ///
    /// Auth: assembly. Errors: `RotationDelayRequired`, `InvalidCouncil`,
    /// `InvalidThreshold`, `AdministratorInCouncil`.
    pub fn rotate_council(env: Env, council: Vec<Address>, threshold: u32) -> Result<(), Error> {
        let mut config = storage::read_config(&env)?;
        config.assembly.require_auth();
        if storage::read_rotation_delay(&env) > 0 {
            return Err(Error::RotationDelayRequired);
        }

        logic::validate_governance(&config.administrator, &council, threshold)?;

        config.threshold = threshold;
        storage::write_config(&env, &config);
        storage::write_council(&env, &council);
        storage::extend_instance(&env);
        CouncilRotated { council, threshold }.publish(&env);
        Ok(())
    }

    /// Announces a council rotation. It can be executed once the rotation delay
    /// has passed, and cancelled until then. Residents can read it with
    /// `get_pending_rotation` and see the `RotationAnnounced` event. Only one
    /// rotation can be announced at a time.
    ///
    /// Auth: assembly. Errors: `RotationAlreadyPending`, `InvalidCouncil`,
    /// `InvalidThreshold`, `AdministratorInCouncil`, `Overflow`.
    pub fn announce_rotation(env: Env, council: Vec<Address>, threshold: u32) -> Result<(), Error> {
        let config = storage::read_config(&env)?;
        config.assembly.require_auth();
        if storage::read_pending_rotation(&env).is_some() {
            return Err(Error::RotationAlreadyPending);
        }
        logic::validate_governance(&config.administrator, &council, threshold)?;

        let executable_at = env
            .ledger()
            .timestamp()
            .checked_add(storage::read_rotation_delay(&env))
            .ok_or(Error::Overflow)?;
        storage::write_pending_rotation(
            &env,
            &PendingRotation {
                council: council.clone(),
                threshold,
                executable_at,
            },
        );
        storage::extend_instance(&env);
        RotationAnnounced {
            council,
            threshold,
            executable_at,
        }
        .publish(&env);
        Ok(())
    }

    /// Executes the announced rotation once its delay has passed. The new
    /// council is checked again, because the administrator may have changed
    /// since the announcement. Approvals already given by members who leave the
    /// council stop counting.
    ///
    /// Auth: assembly. Errors: `NoPendingRotation`, `RotationNotReady`,
    /// `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil`.
    pub fn execute_rotation(env: Env) -> Result<(), Error> {
        let mut config = storage::read_config(&env)?;
        config.assembly.require_auth();
        let pending = storage::read_pending_rotation(&env).ok_or(Error::NoPendingRotation)?;
        if env.ledger().timestamp() < pending.executable_at {
            return Err(Error::RotationNotReady);
        }
        logic::validate_governance(&config.administrator, &pending.council, pending.threshold)?;

        config.threshold = pending.threshold;
        storage::write_config(&env, &config);
        storage::write_council(&env, &pending.council);
        storage::clear_pending_rotation(&env);
        storage::extend_instance(&env);
        CouncilRotated {
            council: pending.council,
            threshold: pending.threshold,
        }
        .publish(&env);
        Ok(())
    }

    /// Cancels the announced rotation.
    ///
    /// Auth: assembly. Errors: `NoPendingRotation`.
    pub fn cancel_rotation(env: Env) -> Result<(), Error> {
        let config = storage::read_config(&env)?;
        config.assembly.require_auth();
        let pending = storage::read_pending_rotation(&env).ok_or(Error::NoPendingRotation)?;

        storage::clear_pending_rotation(&env);
        storage::extend_instance(&env);
        RotationCancelled {
            executable_at: pending.executable_at,
        }
        .publish(&env);
        Ok(())
    }

    /// Returns the announced council rotation, if there is one.
    pub fn get_pending_rotation(env: Env) -> Option<PendingRotation> {
        storage::read_pending_rotation(&env)
    }

    /// Returns the waiting period for council rotations, in seconds. Zero means
    /// rotations are immediate.
    pub fn get_rotation_delay(env: Env) -> u64 {
        storage::read_rotation_delay(&env)
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

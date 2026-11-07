//! Executes an approved expense: the only place where funds leave the contract.

use soroban_sdk::{token, Address, Env, Vec};

use crate::errors::Error;
use crate::events::ExpensePaid;
use crate::types::{Config, Expense, ExpenseStatus};
use crate::{logic, storage};

/// Pays the vendor of an expense that reached the approval threshold.
///
/// Everything that could have changed since the proposal is checked again:
/// the vendor, the council and the remaining budget. State is written before
/// the transfer, so the contract is consistent whatever the token does.
///
/// Errors: `VendorNotApproved`, `VendorIsInsider`, `UnknownCategory`,
/// `OverBudget`, `Overflow`, `InsufficientBalance`.
pub fn execute(
    env: &Env,
    config: &Config,
    council: &Vec<Address>,
    mut expense: Expense,
) -> Result<(), Error> {
    if !storage::read_vendors(env).contains(&expense.vendor) {
        return Err(Error::VendorNotApproved);
    }
    if logic::is_insider(
        &expense.vendor,
        &config.assembly,
        &config.administrator,
        council,
    ) {
        return Err(Error::VendorIsInsider);
    }
    let line = storage::read_budget(env, &expense.category).ok_or(Error::UnknownCategory)?;
    let updated_line = logic::after_payment(&line, expense.amount)?;

    let token = token::Client::new(env, &config.token);
    let treasury = env.current_contract_address();
    if token.balance(&treasury) < expense.amount {
        return Err(Error::InsufficientBalance);
    }

    storage::write_budget(env, &expense.category, &updated_line);
    expense.status = ExpenseStatus::Paid;
    expense.paid_at = Some(env.ledger().timestamp());
    storage::write_expense(env, &expense);
    storage::extend_instance(env);

    token.transfer(&treasury, &expense.vendor, &expense.amount);

    ExpensePaid {
        id: expense.id,
        vendor: expense.vendor,
        amount: expense.amount,
    }
    .publish(env);
    Ok(())
}

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::Address;

use super::setup::{invoice_hash, maintenance, numbered_category, without_auths, Fixture};
use crate::{Error, ExpenseStatus, MAX_PAGE};

#[test]
fn propose_expense_creates_a_pending_expense_with_its_details() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.env.ledger().set_timestamp(1_234);

    let id = f.propose(&vendor, 8_000);

    let expense = f.treasury.get_expense(&id);
    assert_eq!(id, 0);
    assert_eq!(expense.id, 0);
    assert_eq!(expense.category, maintenance(&f.env));
    assert_eq!(expense.vendor, vendor);
    assert_eq!(expense.amount, 8_000);
    assert_eq!(expense.invoice_hash, invoice_hash(&f.env));
    assert_eq!(expense.approvals.len(), 0);
    assert_eq!(expense.status, ExpenseStatus::Pending);
    assert_eq!(expense.created_at, 1_234);
    assert_eq!(expense.paid_at, None);
}

#[test]
fn propose_expense_assigns_consecutive_ids() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    assert_eq!(f.propose(&vendor, 100), 0);
    assert_eq!(f.propose(&vendor, 100), 1);
    assert_eq!(f.treasury.expense_count(), 2);
}

#[test]
fn propose_expense_does_not_move_money_or_spend_budget() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.token_admin.mint(&f.treasury.address, &10_000);

    f.propose(&vendor, 8_000);

    assert_eq!(f.treasury.balance(), 10_000);
    assert_eq!(f.token.balance(&vendor), 0);
    assert_eq!(
        f.treasury.get_budget(&maintenance(&f.env)).unwrap().spent,
        0
    );
}

#[test]
fn propose_expense_accepts_an_amount_equal_to_the_limit() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    assert_eq!(f.propose(&vendor, 10_000), 0);
}

#[test]
fn propose_expense_rejects_an_amount_above_the_limit() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    let result = f.treasury.try_propose_expense(
        &maintenance(&f.env),
        &vendor,
        &10_001,
        &invoice_hash(&f.env),
    );

    assert_eq!(result, Err(Ok(Error::OverBudget)));
    assert_eq!(f.treasury.expense_count(), 0);
}

#[test]
fn propose_expense_rejects_a_zero_or_negative_amount() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    for amount in [0, -5] {
        let result = f.treasury.try_propose_expense(
            &maintenance(&f.env),
            &vendor,
            &amount,
            &invoice_hash(&f.env),
        );
        assert_eq!(result, Err(Ok(Error::InvalidAmount)));
    }
}

#[test]
fn propose_expense_rejects_an_unknown_category() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    let result = f.treasury.try_propose_expense(
        &numbered_category(&f.env, 0),
        &vendor,
        &100,
        &invoice_hash(&f.env),
    );

    assert_eq!(result, Err(Ok(Error::UnknownCategory)));
}

#[test]
fn propose_expense_rejects_a_vendor_that_is_not_approved() {
    let f = Fixture::new();
    f.prepare(10_000);

    let result = f.treasury.try_propose_expense(
        &maintenance(&f.env),
        &Address::generate(&f.env),
        &100,
        &invoice_hash(&f.env),
    );

    assert_eq!(result, Err(Ok(Error::VendorNotApproved)));
}

#[test]
fn propose_expense_asks_for_the_administrators_signature_only() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    f.propose(&vendor, 100);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.administrator);
}

#[test]
fn propose_expense_fails_without_a_signature() {
    let (env, treasury) = without_auths();

    let result = treasury.try_propose_expense(
        &maintenance(&env),
        &Address::generate(&env),
        &100,
        &invoice_hash(&env),
    );

    assert!(result.is_err());
}

#[test]
fn get_expense_fails_for_an_unknown_id() {
    let f = Fixture::new();

    assert_eq!(
        f.treasury.try_get_expense(&0),
        Err(Ok(Error::ExpenseNotFound))
    );
}

#[test]
fn get_expenses_returns_the_requested_page_in_id_order() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    for amount in [100, 200, 300] {
        f.propose(&vendor, amount);
    }

    let first_page = f.treasury.get_expenses(&0, &2);
    let last_page = f.treasury.get_expenses(&2, &10);

    assert_eq!(first_page.len(), 2);
    assert_eq!(first_page.get(1).unwrap().amount, 200);
    assert_eq!(last_page.len(), 1);
    assert_eq!(last_page.get(0).unwrap().amount, 300);
    assert_eq!(f.treasury.get_expenses(&3, &10).len(), 0);
}

#[test]
fn get_expenses_caps_the_page_size() {
    let f = Fixture::new();
    let vendor = f.prepare(1_000_000);
    for _ in 0..MAX_PAGE + 1 {
        f.propose(&vendor, 1);
    }

    assert_eq!(f.treasury.get_expenses(&0, &1_000).len(), MAX_PAGE);
}

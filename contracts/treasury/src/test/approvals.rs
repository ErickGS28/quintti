use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::Address;

use super::setup::{maintenance, Fixture, THRESHOLD};
use crate::{BudgetLine, Error, ExpenseStatus};

#[test]
fn an_approval_below_the_threshold_is_recorded_without_paying() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 8_000);

    f.approve(id, 1);

    let expense = f.treasury.get_expense(&id);
    assert_eq!(expense.status, ExpenseStatus::Pending);
    assert_eq!(expense.approvals.len(), 1);
    assert_eq!(f.token.balance(&vendor), 0);
    assert_eq!(f.treasury.balance(), 10_000);
    assert_eq!(
        f.treasury.get_budget(&maintenance(&f.env)).unwrap().spent,
        0
    );
}

#[test]
fn the_approval_that_reaches_the_threshold_pays_the_vendor() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 8_000);
    f.env.ledger().set_timestamp(5_000);

    f.approve(id, THRESHOLD as usize);

    let expense = f.treasury.get_expense(&id);
    assert_eq!(expense.status, ExpenseStatus::Paid);
    assert_eq!(expense.paid_at, Some(5_000));
    assert_eq!(f.token.balance(&vendor), 8_000);
    assert_eq!(f.treasury.balance(), 2_000);
    assert_eq!(
        f.treasury.get_budget(&maintenance(&f.env)),
        Some(BudgetLine {
            limit: 10_000,
            spent: 8_000
        })
    );
}

#[test]
fn a_paid_expense_cannot_be_approved_or_paid_again() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 4_000);
    f.approve(id, 2);

    let third = f.treasury.try_approve_expense(&f.council[2], &id);

    assert_eq!(third, Err(Ok(Error::ExpenseNotPending)));
    assert_eq!(f.token.balance(&vendor), 4_000);
}

#[test]
fn a_council_member_cannot_approve_twice() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);
    f.treasury.approve_expense(&f.council[0], &id);

    let again = f.treasury.try_approve_expense(&f.council[0], &id);

    assert_eq!(again, Err(Ok(Error::AlreadyApproved)));
    assert_eq!(f.treasury.get_expense(&id).approvals.len(), 1);
}

#[test]
fn only_council_members_can_approve() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    for outsider in [
        f.administrator.clone(),
        f.assembly.clone(),
        Address::generate(&f.env),
    ] {
        assert_eq!(
            f.treasury.try_approve_expense(&outsider, &id),
            Err(Ok(Error::NotCouncilMember))
        );
    }
    assert_eq!(f.treasury.get_expense(&id).approvals.len(), 0);
}

#[test]
fn approving_an_unknown_expense_fails() {
    let f = Fixture::new();

    assert_eq!(
        f.treasury.try_approve_expense(&f.council[0], &99),
        Err(Ok(Error::ExpenseNotFound))
    );
}

#[test]
fn a_payment_larger_than_the_balance_is_rejected_and_nothing_changes() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(3_000);
    let id = f.propose(&vendor, 8_000);
    f.treasury.approve_expense(&f.council[0], &id);

    let second = f.treasury.try_approve_expense(&f.council[1], &id);

    assert_eq!(second, Err(Ok(Error::InsufficientBalance)));
    let expense = f.treasury.get_expense(&id);
    assert_eq!(expense.status, ExpenseStatus::Pending);
    assert_eq!(expense.approvals.len(), 1);
    assert_eq!(f.treasury.balance(), 3_000);
    assert_eq!(
        f.treasury.get_budget(&maintenance(&f.env)).unwrap().spent,
        0
    );
}

#[test]
fn the_budget_is_checked_again_when_paying() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(20_000);
    let first = f.propose(&vendor, 6_000);
    let second = f.propose(&vendor, 6_000);
    f.approve(first, 2);
    f.treasury.approve_expense(&f.council[0], &second);

    let result = f.treasury.try_approve_expense(&f.council[1], &second);

    assert_eq!(result, Err(Ok(Error::OverBudget)));
    assert_eq!(
        f.treasury.get_expense(&second).status,
        ExpenseStatus::Pending
    );
    assert_eq!(f.token.balance(&vendor), 6_000);
}

#[test]
fn the_vendor_is_checked_again_when_paying() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 1_000);
    f.treasury.approve_expense(&f.council[0], &id);
    f.treasury.set_vendor(&vendor, &false);

    let result = f.treasury.try_approve_expense(&f.council[1], &id);

    assert_eq!(result, Err(Ok(Error::VendorNotApproved)));
    assert_eq!(f.token.balance(&vendor), 0);
}

#[test]
fn a_budget_limit_cannot_drop_below_what_was_paid() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 6_000);
    f.approve(id, 2);

    let below = f.treasury.try_set_budget(&maintenance(&f.env), &5_999);
    f.treasury.set_budget(&maintenance(&f.env), &6_000);

    assert_eq!(below, Err(Ok(Error::BudgetBelowSpent)));
    assert_eq!(
        f.treasury.get_budget(&maintenance(&f.env)).unwrap().limit,
        6_000
    );
}

#[test]
fn approve_expense_asks_for_the_approvers_signature_only() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    f.treasury.approve_expense(&f.council[1], &id);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.council[1]);
}

#[test]
fn approve_expense_fails_without_a_signature() {
    let (env, treasury) = super::setup::without_auths();

    let result = treasury.try_approve_expense(&Address::generate(&env), &0);

    assert!(matches!(result, Err(Err(_))));
}

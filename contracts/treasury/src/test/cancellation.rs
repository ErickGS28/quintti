use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup::{without_auths, Fixture};
use crate::{Error, ExpenseStatus};

#[test]
fn the_administrator_can_cancel_a_pending_expense() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    f.treasury.cancel_expense(&f.administrator, &id);

    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Cancelled);
}

#[test]
fn the_assembly_can_cancel_a_pending_expense() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    f.treasury.cancel_expense(&f.assembly, &id);

    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Cancelled);
}

#[test]
fn council_members_and_outsiders_cannot_cancel() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    for caller in [f.council[0].clone(), Address::generate(&f.env)] {
        assert_eq!(
            f.treasury.try_cancel_expense(&caller, &id),
            Err(Ok(Error::NotAuthorized))
        );
    }
    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Pending);
}

#[test]
fn a_cancelled_expense_cannot_be_approved_or_paid() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 1_000);
    f.treasury.approve_expense(&f.council[0], &id);
    f.treasury.cancel_expense(&f.administrator, &id);

    let result = f.treasury.try_approve_expense(&f.council[1], &id);

    assert_eq!(result, Err(Ok(Error::ExpenseNotPending)));
    assert_eq!(f.token.balance(&vendor), 0);
    assert_eq!(f.treasury.balance(), 10_000);
}

#[test]
fn a_paid_expense_cannot_be_cancelled() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 1_000);
    f.approve(id, 2);

    let result = f.treasury.try_cancel_expense(&f.administrator, &id);

    assert_eq!(result, Err(Ok(Error::ExpenseNotPending)));
    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Paid);
}

#[test]
fn cancelling_twice_or_an_unknown_expense_fails() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);
    f.treasury.cancel_expense(&f.administrator, &id);

    assert_eq!(
        f.treasury.try_cancel_expense(&f.administrator, &id),
        Err(Ok(Error::ExpenseNotPending))
    );
    assert_eq!(
        f.treasury.try_cancel_expense(&f.administrator, &99),
        Err(Ok(Error::ExpenseNotFound))
    );
}

#[test]
fn cancel_expense_asks_for_the_callers_signature_only() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    f.treasury.cancel_expense(&f.assembly, &id);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.assembly);
}

#[test]
fn cancel_expense_fails_without_a_signature() {
    let (env, treasury) = without_auths();

    let result = treasury.try_cancel_expense(&Address::generate(&env), &0);

    assert!(matches!(result, Err(Err(_))));
}

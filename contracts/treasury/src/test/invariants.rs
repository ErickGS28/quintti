//! Properties that must hold after any sequence of actions, and the error
//! variants that need special setup to reach.

use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup::{invoice_hash, maintenance, Fixture};
use crate::{DataKey, Error};

#[test]
fn funds_are_conserved_across_payments_cancellations_and_rejections() {
    let f = Fixture::new();
    let vendor_a = f.prepare(10_000);
    let vendor_b = Address::generate(&f.env);
    f.treasury.set_vendor(&vendor_b, &true);
    f.fund(9_000);

    let paid_first = f.propose(&vendor_a, 4_000);
    f.approve(paid_first, 2);
    let cancelled = f.propose(&vendor_b, 2_000);
    f.treasury.cancel_expense(&f.administrator, &cancelled);
    let unaffordable = f.propose(&vendor_b, 6_000);
    f.treasury.approve_expense(&f.council[0], &unaffordable);
    let rejected = f.treasury.try_approve_expense(&f.council[1], &unaffordable);
    let paid_last = f.propose(&vendor_b, 5_000);
    f.approve(paid_last, 2);

    let paid_out = f.token.balance(&vendor_a) + f.token.balance(&vendor_b);
    let spent = f.treasury.get_budget(&maintenance(&f.env)).unwrap().spent;
    assert_eq!(rejected, Err(Ok(Error::InsufficientBalance)));
    assert_eq!(f.treasury.balance() + paid_out, 9_000);
    assert_eq!(spent, paid_out);
}

#[test]
fn what_a_category_pays_never_exceeds_its_limit() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(100_000);
    for _ in 0..3 {
        let id = f.propose(&vendor, 3_000);
        f.approve(id, 2);
    }

    let fourth = f.treasury.try_propose_expense(
        &maintenance(&f.env),
        &vendor,
        &3_000,
        &invoice_hash(&f.env),
    );

    let spent = f.treasury.get_budget(&maintenance(&f.env)).unwrap().spent;
    assert_eq!(fourth, Err(Ok(Error::OverBudget)));
    assert_eq!(spent, 9_000);
    assert_eq!(f.token.balance(&vendor), 9_000);
}

#[test]
fn a_payment_that_would_overflow_the_spent_total_is_rejected() {
    let f = Fixture::new();
    let vendor = f.prepare(i128::MAX);
    f.fund(1);
    let first = f.propose(&vendor, 1);
    f.approve(first, 2);

    let result = f.treasury.try_propose_expense(
        &maintenance(&f.env),
        &vendor,
        &i128::MAX,
        &invoice_hash(&f.env),
    );

    assert_eq!(result, Err(Ok(Error::Overflow)));
}

#[test]
fn reading_the_config_reports_when_it_is_missing() {
    let f = Fixture::new();
    f.env.as_contract(&f.treasury.address, || {
        f.env.storage().instance().remove(&DataKey::Config);
    });

    assert_eq!(f.treasury.try_get_config(), Err(Ok(Error::NotInitialized)));
}

//! Replacing the administrator and rotating the council.

use core::slice::from_ref;

use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup::{council_vec, invoice_hash, maintenance, without_auths, Fixture};
use crate::{Error, ExpenseStatus};

#[test]
fn set_administrator_replaces_the_role() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let successor = Address::generate(&f.env);

    f.treasury.set_administrator(&successor);
    f.treasury
        .propose_expense(&maintenance(&f.env), &vendor, &100, &invoice_hash(&f.env));

    assert_eq!(f.env.auths()[0].0, successor);
    assert_eq!(f.treasury.get_config().administrator, successor);
}

#[test]
fn set_administrator_rejects_a_council_member() {
    let f = Fixture::new();

    let result = f.treasury.try_set_administrator(&f.council[0]);

    assert_eq!(result, Err(Ok(Error::AdministratorInCouncil)));
    assert_eq!(f.treasury.get_config().administrator, f.administrator);
}

#[test]
fn set_administrator_keeps_pending_expenses_pending() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);

    f.treasury.set_administrator(&Address::generate(&f.env));

    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Pending);
}

#[test]
fn a_new_administrator_cannot_be_a_vendor_who_is_paid() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.treasury.set_administrator(&vendor);

    let result =
        f.treasury
            .try_propose_expense(&maintenance(&f.env), &vendor, &100, &invoice_hash(&f.env));

    assert_eq!(result, Err(Ok(Error::VendorIsInsider)));
}

#[test]
fn rotate_council_replaces_members_and_threshold() {
    let f = Fixture::new();
    let members = [
        Address::generate(&f.env),
        Address::generate(&f.env),
        Address::generate(&f.env),
        Address::generate(&f.env),
    ];

    f.treasury
        .rotate_council(&council_vec(&f.env, &members), &3);

    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &members));
    assert_eq!(f.treasury.get_config().threshold, 3);
}

#[test]
fn rotate_council_validates_the_new_council() {
    let f = Fixture::new();
    let member = Address::generate(&f.env);

    assert_eq!(
        f.treasury.try_rotate_council(&council_vec(&f.env, &[]), &1),
        Err(Ok(Error::InvalidCouncil))
    );
    assert_eq!(
        f.treasury
            .try_rotate_council(&council_vec(&f.env, from_ref(&member)), &2),
        Err(Ok(Error::InvalidThreshold))
    );
    assert_eq!(
        f.treasury
            .try_rotate_council(&council_vec(&f.env, from_ref(&f.administrator)), &1),
        Err(Ok(Error::AdministratorInCouncil))
    );
    assert_eq!(f.treasury.get_council().len(), 3);
}

#[test]
fn approvals_from_removed_members_stop_counting() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 4_000);
    f.treasury.approve_expense(&f.council[0], &id);
    let newcomer = Address::generate(&f.env);
    f.treasury.rotate_council(
        &council_vec(
            &f.env,
            &[f.council[1].clone(), f.council[2].clone(), newcomer],
        ),
        &2,
    );

    f.treasury.approve_expense(&f.council[1], &id);
    let after_one_current_member = f.treasury.get_expense(&id).status;
    f.treasury.approve_expense(&f.council[2], &id);

    assert_eq!(after_one_current_member, ExpenseStatus::Pending);
    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Paid);
    assert_eq!(f.token.balance(&vendor), 4_000);
}

#[test]
fn a_removed_member_can_no_longer_approve() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let id = f.propose(&vendor, 100);
    f.treasury.rotate_council(
        &council_vec(&f.env, &[f.council[1].clone(), Address::generate(&f.env)]),
        &2,
    );

    let result = f.treasury.try_approve_expense(&f.council[0], &id);

    assert_eq!(result, Err(Ok(Error::NotCouncilMember)));
}

#[test]
fn a_vendor_who_joins_the_council_is_not_paid() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 1_000);
    f.treasury.approve_expense(&f.council[0], &id);
    f.treasury.rotate_council(
        &council_vec(
            &f.env,
            &[vendor.clone(), f.council[1].clone(), f.council[2].clone()],
        ),
        &2,
    );
    f.treasury.approve_expense(&f.council[1], &id);

    let result = f.treasury.try_approve_expense(&f.council[2], &id);

    assert_eq!(result, Err(Ok(Error::VendorIsInsider)));
    assert_eq!(f.token.balance(&vendor), 0);
}

#[test]
fn handover_calls_ask_for_the_assemblys_signature_only() {
    let f = Fixture::new();

    f.treasury.set_administrator(&Address::generate(&f.env));
    assert_eq!(f.env.auths()[0].0, f.assembly);
    assert_eq!(f.env.auths().len(), 1);

    f.treasury
        .rotate_council(&council_vec(&f.env, &[Address::generate(&f.env)]), &1);
    assert_eq!(f.env.auths()[0].0, f.assembly);
    assert_eq!(f.env.auths().len(), 1);
}

#[test]
fn handover_calls_fail_without_a_signature() {
    let (env, treasury) = without_auths();
    let member = council_vec(&env, &[Address::generate(&env)]);

    assert!(treasury
        .try_set_administrator(&Address::generate(&env))
        .is_err());
    assert!(treasury.try_rotate_council(&member, &1).is_err());
}

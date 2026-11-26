//! Rotating the council with a waiting period: announce, wait, execute.

use core::slice::from_ref;

use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::Address;

use super::setup::{council_vec, without_auths, Fixture};
use crate::{Error, ExpenseStatus};

/// Two days, the first proposal in decision 0017.
const DELAY: u64 = 172_800;
const START: u64 = 10_000;

/// A treasury with a waiting period, at a known ledger time.
fn fixture() -> Fixture<'static> {
    let f = Fixture::with_rotation_delay(DELAY);
    f.env.ledger().set_timestamp(START);
    f
}

fn newcomers(f: &Fixture) -> soroban_sdk::Vec<Address> {
    council_vec(
        &f.env,
        &[
            f.council[1].clone(),
            f.council[2].clone(),
            Address::generate(&f.env),
        ],
    )
}

#[test]
fn the_delay_is_stored_and_zero_by_default() {
    assert_eq!(fixture().treasury.get_rotation_delay(), DELAY);
    assert_eq!(Fixture::new().treasury.get_rotation_delay(), 0);
}

#[test]
fn with_a_delay_the_council_cannot_change_at_once() {
    let f = fixture();

    let result = f.treasury.try_rotate_council(&newcomers(&f), &2);

    assert_eq!(result, Err(Ok(Error::RotationDelayRequired)));
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
}

#[test]
fn announcing_records_the_change_and_when_it_can_run() {
    let f = fixture();
    let council = newcomers(&f);

    f.treasury.announce_rotation(&council, &2);

    let pending = f.treasury.get_pending_rotation().unwrap();
    assert_eq!(pending.council, council);
    assert_eq!(pending.threshold, 2);
    assert_eq!(pending.executable_at, START + DELAY);
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
}

#[test]
fn announcing_changes_nothing_until_it_is_executed() {
    let f = fixture();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 1_000);

    f.treasury.announce_rotation(&newcomers(&f), &2);
    f.treasury.approve_expense(&f.council[0], &id);

    assert_eq!(f.treasury.get_config().threshold, 2);
    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Pending);
}

#[test]
fn the_rotation_cannot_run_before_the_delay() {
    let f = fixture();
    f.treasury.announce_rotation(&newcomers(&f), &2);

    f.env.ledger().set_timestamp(START + DELAY - 1);
    let result = f.treasury.try_execute_rotation();

    assert_eq!(result, Err(Ok(Error::RotationNotReady)));
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
    assert!(f.treasury.get_pending_rotation().is_some());
}

#[test]
fn the_rotation_runs_once_the_delay_has_passed() {
    let f = fixture();
    let council = newcomers(&f);
    f.treasury.announce_rotation(&council, &2);

    f.env.ledger().set_timestamp(START + DELAY);
    f.treasury.execute_rotation();

    assert_eq!(f.treasury.get_council(), council);
    assert_eq!(f.treasury.get_config().threshold, 2);
    assert_eq!(f.treasury.get_pending_rotation(), None);
}

#[test]
fn a_rotation_can_run_long_after_the_delay() {
    let f = fixture();
    let council = newcomers(&f);
    f.treasury.announce_rotation(&council, &1);

    f.env.ledger().set_timestamp(START + DELAY * 10);
    f.treasury.execute_rotation();

    assert_eq!(f.treasury.get_council(), council);
    assert_eq!(f.treasury.get_config().threshold, 1);
}

#[test]
fn the_assembly_can_cancel_an_announced_rotation() {
    let f = fixture();
    f.treasury.announce_rotation(&newcomers(&f), &2);

    f.treasury.cancel_rotation();

    assert_eq!(f.treasury.get_pending_rotation(), None);
    f.env.ledger().set_timestamp(START + DELAY);
    assert_eq!(
        f.treasury.try_execute_rotation(),
        Err(Ok(Error::NoPendingRotation))
    );
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
}

#[test]
fn a_cancelled_rotation_can_be_announced_again() {
    let f = fixture();
    f.treasury.announce_rotation(&newcomers(&f), &2);
    f.treasury.cancel_rotation();

    f.env.ledger().set_timestamp(START + 500);
    f.treasury.announce_rotation(&newcomers(&f), &3);

    let pending = f.treasury.get_pending_rotation().unwrap();
    assert_eq!(pending.threshold, 3);
    assert_eq!(pending.executable_at, START + 500 + DELAY);
}

#[test]
fn only_one_rotation_can_be_announced_at_a_time() {
    let f = fixture();
    f.treasury.announce_rotation(&newcomers(&f), &2);

    let result = f.treasury.try_announce_rotation(&newcomers(&f), &1);

    assert_eq!(result, Err(Ok(Error::RotationAlreadyPending)));
    assert_eq!(f.treasury.get_pending_rotation().unwrap().threshold, 2);
}

#[test]
fn executing_or_cancelling_with_nothing_announced_fails() {
    let f = fixture();

    assert_eq!(
        f.treasury.try_execute_rotation(),
        Err(Ok(Error::NoPendingRotation))
    );
    assert_eq!(
        f.treasury.try_cancel_rotation(),
        Err(Ok(Error::NoPendingRotation))
    );
}

#[test]
fn announcing_validates_the_new_council() {
    let f = fixture();
    let member = Address::generate(&f.env);

    assert_eq!(
        f.treasury
            .try_announce_rotation(&council_vec(&f.env, &[]), &1),
        Err(Ok(Error::InvalidCouncil))
    );
    assert_eq!(
        f.treasury
            .try_announce_rotation(&council_vec(&f.env, from_ref(&member)), &2),
        Err(Ok(Error::InvalidThreshold))
    );
    assert_eq!(
        f.treasury
            .try_announce_rotation(&council_vec(&f.env, from_ref(&f.administrator)), &1),
        Err(Ok(Error::AdministratorInCouncil))
    );
    assert_eq!(f.treasury.get_pending_rotation(), None);
}

#[test]
fn executing_checks_the_council_again_when_the_administrator_changed() {
    let f = fixture();
    let successor = Address::generate(&f.env);
    let council = council_vec(&f.env, &[successor.clone(), f.council[0].clone()]);
    f.treasury.announce_rotation(&council, &1);
    f.treasury.set_administrator(&successor);

    f.env.ledger().set_timestamp(START + DELAY);
    let result = f.treasury.try_execute_rotation();

    assert_eq!(result, Err(Ok(Error::AdministratorInCouncil)));
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
}

#[test]
fn approvals_from_members_who_leave_stop_counting_after_the_rotation() {
    let f = fixture();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let id = f.propose(&vendor, 4_000);
    f.treasury.approve_expense(&f.council[0], &id);
    f.treasury.announce_rotation(&newcomers(&f), &2);
    f.env.ledger().set_timestamp(START + DELAY);
    f.treasury.execute_rotation();

    f.treasury.approve_expense(&f.council[1], &id);
    let after_one_current_member = f.treasury.get_expense(&id).status;
    f.treasury.approve_expense(&f.council[2], &id);

    assert_eq!(after_one_current_member, ExpenseStatus::Pending);
    assert_eq!(f.treasury.get_expense(&id).status, ExpenseStatus::Paid);
}

#[test]
fn without_a_delay_an_announced_rotation_can_run_at_once() {
    let f = Fixture::new();
    f.env.ledger().set_timestamp(START);
    let council = newcomers(&f);

    f.treasury.announce_rotation(&council, &2);
    f.treasury.execute_rotation();

    assert_eq!(f.treasury.get_council(), council);
}

#[test]
fn rotation_calls_ask_for_the_assemblys_signature_only() {
    let f = fixture();

    f.treasury.announce_rotation(&newcomers(&f), &2);
    assert_eq!(f.env.auths()[0].0, f.assembly);
    assert_eq!(f.env.auths().len(), 1);

    f.treasury.cancel_rotation();
    assert_eq!(f.env.auths()[0].0, f.assembly);
    assert_eq!(f.env.auths().len(), 1);

    f.treasury.announce_rotation(&newcomers(&f), &2);
    f.env.ledger().set_timestamp(START + DELAY);
    f.treasury.execute_rotation();
    assert_eq!(f.env.auths()[0].0, f.assembly);
    assert_eq!(f.env.auths().len(), 1);
}

#[test]
fn rotation_calls_fail_without_a_signature() {
    let (env, treasury) = without_auths();
    let council = council_vec(&env, &[Address::generate(&env)]);

    assert!(treasury.try_announce_rotation(&council, &1).is_err());
    assert!(treasury.try_execute_rotation().is_err());
    assert!(treasury.try_cancel_rotation().is_err());
}

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, Vec};

use super::setup::{council_vec, register, Fixture, THRESHOLD};
use crate::MAX_COUNCIL;

#[test]
fn constructor_stores_roles_and_threshold() {
    let f = Fixture::new();

    let config = f.treasury.get_config();

    assert_eq!(config.token, f.token.address);
    assert_eq!(config.assembly, f.assembly);
    assert_eq!(config.administrator, f.administrator);
    assert_eq!(config.threshold, THRESHOLD);
    assert_eq!(f.treasury.get_council(), council_vec(&f.env, &f.council));
}

#[test]
fn balance_starts_at_zero_and_follows_deposits() {
    let f = Fixture::new();
    assert_eq!(f.treasury.balance(), 0);

    f.token_admin.mint(&f.treasury.address, &1_000);

    assert_eq!(f.treasury.balance(), 1_000);
}

/// Registers with the default roles but a custom council and threshold.
fn try_register(council_size: u32, threshold: u32, administrator_in_council: bool) {
    let env = Env::default();
    let token = Address::generate(&env);
    let assembly = Address::generate(&env);
    let administrator = Address::generate(&env);
    let mut council = Vec::new(&env);
    for _ in 0..council_size {
        council.push_back(Address::generate(&env));
    }
    if administrator_in_council {
        council.push_back(administrator.clone());
    }
    register(&env, &token, &assembly, &administrator, &council, threshold);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn constructor_rejects_an_empty_council() {
    try_register(0, 1, false);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn constructor_rejects_a_council_above_the_maximum() {
    try_register(MAX_COUNCIL + 1, 1, false);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn constructor_rejects_duplicate_council_members() {
    let env = Env::default();
    let member = Address::generate(&env);
    register(
        &env,
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &council_vec(&env, &[member.clone(), member]),
        1,
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn constructor_rejects_a_zero_threshold() {
    try_register(3, 0, false);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn constructor_rejects_a_threshold_above_the_council_size() {
    try_register(3, 4, false);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn constructor_rejects_an_administrator_who_is_also_on_the_council() {
    try_register(2, 2, true);
}

#[test]
fn constructor_accepts_the_largest_council_with_a_unanimous_threshold() {
    try_register(MAX_COUNCIL, MAX_COUNCIL, false);
}

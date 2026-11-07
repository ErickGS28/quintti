use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup::{without_auths, Fixture};
use crate::Error;

#[test]
fn deposit_moves_tokens_from_the_payer_into_the_treasury() {
    let f = Fixture::new();
    let payer = Address::generate(&f.env);
    f.token_admin.mint(&payer, &1_000);

    f.treasury.deposit(&payer, &400);

    assert_eq!(f.token.balance(&payer), 600);
    assert_eq!(f.treasury.balance(), 400);
}

#[test]
fn deposit_asks_for_the_payers_signature() {
    let f = Fixture::new();
    let payer = Address::generate(&f.env);
    f.token_admin.mint(&payer, &1_000);

    f.treasury.deposit(&payer, &400);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, payer);
}

#[test]
fn deposit_rejects_a_zero_or_negative_amount() {
    let f = Fixture::new();
    let payer = Address::generate(&f.env);

    assert_eq!(
        f.treasury.try_deposit(&payer, &0),
        Err(Ok(Error::InvalidAmount))
    );
    assert_eq!(
        f.treasury.try_deposit(&payer, &-1),
        Err(Ok(Error::InvalidAmount))
    );
}

#[test]
fn deposit_fails_when_the_payer_has_too_little() {
    let f = Fixture::new();
    let payer = Address::generate(&f.env);
    f.token_admin.mint(&payer, &10);

    assert!(f.treasury.try_deposit(&payer, &11).is_err());
    assert_eq!(f.treasury.balance(), 0);
}

#[test]
fn deposit_fails_without_a_signature() {
    let (env, treasury) = without_auths();

    let result = treasury.try_deposit(&Address::generate(&env), &100);

    assert!(matches!(result, Err(Err(_))));
}

//! The building's name and the words that go with an expense.

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

use super::setup::{
    building_name, council_vec, description, invoice_hash, maintenance, no_uri, register,
    without_auths, Fixture,
};
use crate::{Error, MAX_DESCRIPTION_BYTES, MAX_NAME_BYTES, MAX_URI_BYTES};

/// A text of exactly `bytes` bytes.
fn text_of(env: &Env, bytes: u32) -> String {
    String::from_str(env, &"a".repeat(bytes as usize))
}

fn propose_with(
    f: &Fixture,
    vendor: &Address,
    description: &String,
    uri: &String,
) -> Result<u32, Error> {
    match f.treasury.try_propose_expense(
        &maintenance(&f.env),
        vendor,
        &100,
        &invoice_hash(&f.env),
        description,
        uri,
    ) {
        Ok(Ok(id)) => Ok(id),
        Err(Ok(error)) => Err(error),
        other => panic!("unexpected result: {other:?}"),
    }
}

// --- the building's name ---

#[test]
fn the_name_is_stored_at_deployment() {
    let f = Fixture::new();
    assert_eq!(f.treasury.get_name(), building_name(&f.env));
}

#[test]
fn the_assembly_can_rename_the_building() {
    let f = Fixture::new();
    let renamed = String::from_str(&f.env, "Torres del Parque, torre 2");

    f.treasury.set_name(&renamed);
    let auths = f.env.auths();

    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.assembly);
    assert_eq!(f.treasury.get_name(), renamed);
}

#[test]
fn a_name_may_use_the_whole_limit_but_not_more() {
    let f = Fixture::new();

    f.treasury.set_name(&text_of(&f.env, MAX_NAME_BYTES));
    let too_long = f
        .treasury
        .try_set_name(&text_of(&f.env, MAX_NAME_BYTES + 1));

    assert_eq!(too_long, Err(Ok(Error::TextTooLong)));
    assert_eq!(f.treasury.get_name(), text_of(&f.env, MAX_NAME_BYTES));
}

#[test]
fn a_name_cannot_be_empty() {
    let f = Fixture::new();

    let result = f.treasury.try_set_name(&String::from_str(&f.env, ""));

    assert_eq!(result, Err(Ok(Error::EmptyText)));
    assert_eq!(f.treasury.get_name(), building_name(&f.env));
}

#[test]
fn renaming_fails_without_a_signature() {
    let (env, treasury) = without_auths();
    assert!(treasury
        .try_set_name(&String::from_str(&env, "Otro nombre"))
        .is_err());
}

#[test]
#[should_panic(expected = "Error(Contract, #25)")]
fn the_constructor_rejects_an_empty_name() {
    let env = Env::default();
    env.register(
        crate::Treasury,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            council_vec(&env, &[Address::generate(&env)]),
            1u32,
            0u64,
            String::from_str(&env, ""),
        ),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #24)")]
fn the_constructor_rejects_a_name_that_is_too_long() {
    let env = Env::default();
    env.register(
        crate::Treasury,
        (
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
            council_vec(&env, &[Address::generate(&env)]),
            1u32,
            0u64,
            text_of(&env, MAX_NAME_BYTES + 1),
        ),
    );
}

#[test]
fn the_helper_registers_a_valid_building() {
    let env = Env::default();
    let id = register(
        &env,
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &council_vec(&env, &[Address::generate(&env)]),
        1,
    );
    assert_eq!(
        crate::TreasuryClient::new(&env, &id).get_name(),
        building_name(&env)
    );
}

// --- what an expense says about itself ---

#[test]
fn an_expense_keeps_its_description_and_invoice_link() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    let link = String::from_str(&f.env, "https://example.org/facturas/ascensor-0042.pdf");

    let id = propose_with(&f, &vendor, &description(&f.env), &link).unwrap();

    let expense = f.treasury.get_expense(&id);
    assert_eq!(expense.description, description(&f.env));
    assert_eq!(expense.invoice_uri, link);
}

#[test]
fn the_invoice_link_is_optional() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    let id = propose_with(&f, &vendor, &description(&f.env), &no_uri(&f.env)).unwrap();

    assert_eq!(f.treasury.get_expense(&id).invoice_uri, no_uri(&f.env));
}

#[test]
fn an_expense_needs_a_description() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    let result = propose_with(&f, &vendor, &String::from_str(&f.env, ""), &no_uri(&f.env));

    assert_eq!(result, Err(Error::EmptyText));
    assert_eq!(f.treasury.expense_count(), 0);
}

#[test]
fn the_description_and_the_link_have_exact_limits() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);

    let at_the_limit = propose_with(
        &f,
        &vendor,
        &text_of(&f.env, MAX_DESCRIPTION_BYTES),
        &text_of(&f.env, MAX_URI_BYTES),
    );
    let description_too_long = propose_with(
        &f,
        &vendor,
        &text_of(&f.env, MAX_DESCRIPTION_BYTES + 1),
        &no_uri(&f.env),
    );
    let link_too_long = propose_with(
        &f,
        &vendor,
        &description(&f.env),
        &text_of(&f.env, MAX_URI_BYTES + 1),
    );

    assert!(at_the_limit.is_ok());
    assert_eq!(description_too_long, Err(Error::TextTooLong));
    assert_eq!(link_too_long, Err(Error::TextTooLong));
    assert_eq!(f.treasury.expense_count(), 1);
}

#[test]
fn accented_letters_count_by_their_bytes() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    // 101 letters of two bytes each are 202 bytes: over the limit of 200.
    let accented = String::from_str(&f.env, &"ñ".repeat(101));

    let result = propose_with(&f, &vendor, &accented, &no_uri(&f.env));

    assert_eq!(result, Err(Error::TextTooLong));
}

#[test]
fn the_words_survive_payment() {
    let f = Fixture::new();
    let vendor = f.prepare(10_000);
    f.fund(10_000);
    let link = String::from_str(&f.env, "https://example.org/f.pdf");
    let id = propose_with(&f, &vendor, &description(&f.env), &link).unwrap();

    f.approve(id, 2);

    let expense = f.treasury.get_expense(&id);
    assert_eq!(expense.description, description(&f.env));
    assert_eq!(expense.invoice_uri, link);
}

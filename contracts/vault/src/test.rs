//! Tests of the vault: who gets paid, how much, how often, and what stays put.

use soroban_sdk::testutils::{Address as _, Events as _};
use soroban_sdk::{token, Address, Bytes, BytesN, Env, String};

use crate::{Error, Vault, VaultClient, MAX_CODE_BYTES};

/// Five thousand five hundred and fifty-five units, like the challenge.
const LOCKED: i128 = 5_555 * 10_000_000;
/// 55.55 units per account.
const PAYOUT: i128 = 555_500_000;

struct Fixture<'a> {
    env: Env,
    token: token::Client<'a>,
    vault: VaultClient<'a>,
}

fn hash_of(env: &Env, text: &str) -> BytesN<32> {
    env.crypto()
        .sha256(&Bytes::from_slice(env, text.as_bytes()))
        .to_bytes()
}

impl<'a> Fixture<'a> {
    /// A vault opened with "ship it" that holds `LOCKED`, with every authorization mocked.
    fn new() -> Self {
        Self::with_balance(LOCKED)
    }

    fn with_balance(balance: i128) -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let sac = env.register_stellar_asset_contract_v2(Address::generate(&env));
        let token = token::Client::new(&env, &sac.address());
        let vault_id = env.register(Vault, (sac.address(), hash_of(&env, "ship it"), PAYOUT));
        if balance > 0 {
            token::StellarAssetClient::new(&env, &sac.address()).mint(&vault_id, &balance);
        }
        let vault = VaultClient::new(&env, &vault_id);
        Fixture { env, token, vault }
    }

    fn text(&self, value: &str) -> String {
        String::from_str(&self.env, value)
    }

    fn claim(&self, who: &Address, code: &str) -> Result<i128, Error> {
        match self.vault.try_claim(who, &self.text(code)) {
            Ok(Ok(amount)) => Ok(amount),
            Ok(Err(_)) => panic!("the vault returned a value it cannot decode"),
            Err(Ok(error)) => Err(error),
            Err(Err(_)) => panic!("the host rejected the call"),
        }
    }
}

#[test]
fn the_right_code_pays_the_claimer() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);

    assert_eq!(f.claim(&claimer, "ship it"), Ok(PAYOUT));

    assert_eq!(f.token.balance(&claimer), PAYOUT);
    assert_eq!(f.vault.get_balance(), LOCKED - PAYOUT);
    assert_eq!(f.vault.get_claims(), 1);
    assert!(f.vault.has_claimed(&claimer));
}

#[test]
fn the_code_ignores_upper_and_lower_case() {
    let f = Fixture::new();
    let a = Address::generate(&f.env);
    let b = Address::generate(&f.env);
    let c = Address::generate(&f.env);

    assert_eq!(f.claim(&a, "Ship It"), Ok(PAYOUT));
    assert_eq!(f.claim(&b, "SHIP IT"), Ok(PAYOUT));
    assert_eq!(f.claim(&c, "sHiP iT"), Ok(PAYOUT));
}

#[test]
fn a_wrong_code_pays_nothing_and_changes_nothing() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);

    for wrong in [
        "", "ship", "ship  it", " ship it", "ship it ", "shipit", "Ship It!",
    ] {
        assert_eq!(f.claim(&claimer, wrong), Err(Error::WrongCode), "{wrong:?}");
    }

    assert_eq!(f.token.balance(&claimer), 0);
    assert_eq!(f.vault.get_balance(), LOCKED);
    assert_eq!(f.vault.get_claims(), 0);
    assert!(!f.vault.has_claimed(&claimer));
}

#[test]
fn a_wrong_attempt_does_not_use_up_the_claim() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);

    assert_eq!(f.claim(&claimer, "nope"), Err(Error::WrongCode));
    assert_eq!(f.claim(&claimer, "Ship It"), Ok(PAYOUT));
}

#[test]
fn a_text_longer_than_any_code_is_a_wrong_code() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);
    let long = "a".repeat(MAX_CODE_BYTES + 1);
    let longer = "a".repeat(5_000);

    assert_eq!(f.claim(&claimer, &long), Err(Error::WrongCode));
    assert_eq!(f.claim(&claimer, &longer), Err(Error::WrongCode));
    assert_eq!(f.vault.get_balance(), LOCKED);
}

#[test]
fn an_account_claims_only_once() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);

    assert_eq!(f.claim(&claimer, "ship it"), Ok(PAYOUT));
    assert_eq!(f.claim(&claimer, "ship it"), Err(Error::AlreadyClaimed));

    assert_eq!(f.token.balance(&claimer), PAYOUT);
    assert_eq!(f.vault.get_balance(), LOCKED - PAYOUT);
    assert_eq!(f.vault.get_claims(), 1);
}

#[test]
fn a_wrong_code_is_reported_before_a_second_claim() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);
    f.claim(&claimer, "ship it").unwrap();

    assert_eq!(f.claim(&claimer, "nope"), Err(Error::WrongCode));
}

#[test]
fn different_accounts_each_get_a_share() {
    let f = Fixture::new();
    let accounts: [Address; 5] = core::array::from_fn(|_| Address::generate(&f.env));

    for account in &accounts {
        assert_eq!(f.claim(account, "ship it"), Ok(PAYOUT));
    }

    assert_eq!(f.vault.get_claims(), 5);
    assert_eq!(f.vault.get_balance(), LOCKED - 5 * PAYOUT);
    for account in &accounts {
        assert_eq!(f.token.balance(account), PAYOUT);
    }
}

#[test]
fn money_is_conserved_across_claims_and_rejections() {
    let f = Fixture::new();
    let a = Address::generate(&f.env);
    let b = Address::generate(&f.env);

    f.claim(&a, "ship it").unwrap();
    let _ = f.claim(&b, "wrong");
    let _ = f.claim(&a, "ship it");
    f.claim(&b, "ship it").unwrap();

    let total = f.token.balance(&a) + f.token.balance(&b) + f.vault.get_balance();
    assert_eq!(total, LOCKED);
}

#[test]
fn an_empty_vault_refuses_instead_of_failing_in_the_token() {
    let f = Fixture::with_balance(PAYOUT - 1);
    let claimer = Address::generate(&f.env);

    assert_eq!(f.claim(&claimer, "ship it"), Err(Error::VaultEmpty));
    assert!(!f.vault.has_claimed(&claimer));
    assert_eq!(f.vault.get_claims(), 0);
}

#[test]
fn the_last_share_can_be_claimed_exactly() {
    let f = Fixture::with_balance(PAYOUT);
    let claimer = Address::generate(&f.env);

    assert_eq!(f.claim(&claimer, "ship it"), Ok(PAYOUT));
    assert_eq!(f.vault.get_balance(), 0);

    let next = Address::generate(&f.env);
    assert_eq!(f.claim(&next, "ship it"), Err(Error::VaultEmpty));
}

#[test]
fn claiming_asks_for_the_claimers_signature_only() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);
    f.claim(&claimer, "ship it").unwrap();

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, claimer);
}

#[test]
fn claiming_fails_without_the_claimers_signature() {
    let env = Env::default();
    let sac = env.register_stellar_asset_contract_v2(Address::generate(&env));
    let vault_id = env.register(Vault, (sac.address(), hash_of(&env, "ship it"), PAYOUT));
    let vault = VaultClient::new(&env, &vault_id);
    let claimer = Address::generate(&env);

    // Nothing is mocked: someone else's address cannot be named as the claimer.
    assert!(vault
        .try_claim(&claimer, &String::from_str(&env, "ship it"))
        .is_err());
}

#[test]
fn the_vault_reports_how_it_was_opened() {
    let f = Fixture::new();
    let config = f.vault.get_config();

    assert_eq!(config.token, f.token.address);
    assert_eq!(config.payout, PAYOUT);
    assert_eq!(config.code_hash, hash_of(&f.env, "ship it"));
    assert_eq!(f.vault.get_balance(), LOCKED);
    assert_eq!(f.vault.get_claims(), 0);
}

#[test]
fn the_vault_does_not_store_the_code() {
    let f = Fixture::new();
    let stored = f.vault.get_config().code_hash;

    assert_ne!(stored.to_array().as_slice(), b"ship it");
    assert_eq!(stored, hash_of(&f.env, "ship it"));
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn a_payout_of_zero_cannot_open_a_vault() {
    open_with_payout(0);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn a_negative_payout_cannot_open_a_vault() {
    open_with_payout(-1);
}

fn open_with_payout(payout: i128) {
    let env = Env::default();
    let sac = env.register_stellar_asset_contract_v2(Address::generate(&env));
    env.register(Vault, (sac.address(), hash_of(&env, "ship it"), payout));
}

#[test]
fn claiming_publishes_an_event() {
    let f = Fixture::new();
    let claimer = Address::generate(&f.env);
    f.claim(&claimer, "ship it").unwrap();

    // The token publishes its own events too, so look for the vault's.
    let from_vault = f.env.events().all().filter_by_contract(&f.vault.address);
    assert_eq!(from_vault.events().len(), 1);
}

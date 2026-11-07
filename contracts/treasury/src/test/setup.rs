//! Shared test fixture: a registered treasury, a token, and the building's
//! roles as generated addresses.

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, vec, Address, Env, Vec};

use crate::{Treasury, TreasuryClient};

/// Approvals needed in the default fixture (2 of 3).
pub const THRESHOLD: u32 = 2;

pub struct Fixture<'a> {
    pub env: Env,
    pub assembly: Address,
    pub administrator: Address,
    pub council: [Address; 3],
    pub token: token::Client<'a>,
    pub token_admin: token::StellarAssetClient<'a>,
    pub treasury: TreasuryClient<'a>,
}

impl<'a> Fixture<'a> {
    /// A treasury with a 2-of-3 council and every authorization mocked.
    pub fn new() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let assembly = Address::generate(&env);
        let administrator = Address::generate(&env);
        let council = [
            Address::generate(&env),
            Address::generate(&env),
            Address::generate(&env),
        ];

        let sac = env.register_stellar_asset_contract_v2(Address::generate(&env));
        let token = token::Client::new(&env, &sac.address());
        let token_admin = token::StellarAssetClient::new(&env, &sac.address());

        let treasury_id = register(
            &env,
            &sac.address(),
            &assembly,
            &administrator,
            &council_vec(&env, &council),
            THRESHOLD,
        );
        let treasury = TreasuryClient::new(&env, &treasury_id);

        Fixture {
            env,
            assembly,
            administrator,
            council,
            token,
            token_admin,
            treasury,
        }
    }
}

/// Registers a treasury with explicit constructor arguments.
pub fn register(
    env: &Env,
    token: &Address,
    assembly: &Address,
    administrator: &Address,
    council: &Vec<Address>,
    threshold: u32,
) -> Address {
    env.register(
        Treasury,
        (
            token.clone(),
            assembly.clone(),
            administrator.clone(),
            council.clone(),
            threshold,
        ),
    )
}

pub fn council_vec(env: &Env, members: &[Address]) -> Vec<Address> {
    let mut council = vec![env];
    for member in members {
        council.push_back(member.clone());
    }
    council
}

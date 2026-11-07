//! Shared test fixture: a registered treasury, a token, and the building's
//! roles as generated addresses.

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, vec, Address, BytesN, Env, Symbol, Vec};

use crate::{Treasury, TreasuryClient};

/// Approvals needed in the default fixture (2 of 3).
pub const THRESHOLD: u32 = 2;

/// Distinct category names, enough to exceed `MAX_CATEGORIES`.
const CATEGORY_NAMES: [&str; 17] = [
    "c00", "c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12",
    "c13", "c14", "c15", "c16",
];

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

    /// Opens a `maintenance` budget line with `limit` and approves one vendor.
    /// Returns the vendor.
    pub fn prepare(&self, limit: i128) -> Address {
        let vendor = Address::generate(&self.env);
        self.treasury.set_budget(&maintenance(&self.env), &limit);
        self.treasury.set_vendor(&vendor, &true);
        vendor
    }

    /// Proposes an expense in `maintenance` and returns its id.
    pub fn propose(&self, vendor: &Address, amount: i128) -> u32 {
        self.treasury.propose_expense(
            &maintenance(&self.env),
            vendor,
            &amount,
            &invoice_hash(&self.env),
        )
    }

    /// Puts tokens in the treasury, as fees would.
    pub fn fund(&self, amount: i128) {
        self.token_admin.mint(&self.treasury.address, &amount);
    }

    /// Gets `approvals` council members to approve, in council order.
    pub fn approve(&self, id: u32, approvals: usize) {
        for member in self.council.iter().take(approvals) {
            self.treasury.approve_expense(member, &id);
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

/// A fixed invoice fingerprint.
pub fn invoice_hash(env: &Env) -> BytesN<32> {
    BytesN::from_array(env, &[7u8; 32])
}

/// A named category, readable in assertions.
pub fn maintenance(env: &Env) -> Symbol {
    Symbol::new(env, "maintenance")
}

/// The n-th of 17 distinct categories.
pub fn numbered_category(env: &Env, index: usize) -> Symbol {
    Symbol::new(env, CATEGORY_NAMES[index])
}

/// A treasury where no authorization is mocked, to prove that privileged calls
/// fail without the right signature.
pub fn without_auths<'a>() -> (Env, TreasuryClient<'a>) {
    let env = Env::default();
    let council = council_vec(&env, &[Address::generate(&env), Address::generate(&env)]);
    let id = register(
        &env,
        &Address::generate(&env),
        &Address::generate(&env),
        &Address::generate(&env),
        &council,
        1,
    );
    let client = TreasuryClient::new(&env, &id);
    (env, client)
}

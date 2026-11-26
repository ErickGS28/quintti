//! Quintti vault: a contract that locks a token and releases a fixed share,
//! once per account, to whoever presents the right code.
//!
//! Built for the Ship It challenge ("Bóveda"). The vault is opened with the
//! SHA-256 of a code, so the contract never stores the code itself. There is
//! no owner and no way to take the money out except `claim`: that is the
//! point of a vault, and it is why the amount is released in small shares.
//! See `docs/decisions/0021-a-vault-for-ship-it.md`.
#![no_std]

mod errors;
mod events;
mod types;

#[cfg(test)]
mod test;

pub use errors::Error;
pub use types::{Config, DataKey, MAX_CODE_BYTES};

use soroban_sdk::{contract, contractimpl, token, Address, Bytes, BytesN, Env, String};

use events::Claimed;

/// Ledgers close about every 5 seconds.
const LEDGERS_PER_DAY: u32 = 17_280;
/// Extend only when less than this remains.
const TTL_THRESHOLD: u32 = 7 * LEDGERS_PER_DAY;
/// Target lifetime after an extension (about 30 days).
const TTL_EXTEND_TO: u32 = 30 * LEDGERS_PER_DAY;

#[contract]
pub struct Vault;

/// The SHA-256 of a code as the vault reads it: ASCII letters in lowercase, so
/// "Ship It" and "ship it" open the same vault. Anything longer than
/// `MAX_CODE_BYTES` cannot be the code and gives `None`.
fn code_hash(env: &Env, code: &String) -> Option<BytesN<32>> {
    let len = code.len() as usize;
    if len > MAX_CODE_BYTES {
        return None;
    }
    let mut buffer = [0u8; MAX_CODE_BYTES];
    code.copy_into_slice(&mut buffer[..len]);
    buffer[..len].make_ascii_lowercase();
    Some(
        env.crypto()
            .sha256(&Bytes::from_slice(env, &buffer[..len]))
            .to_bytes(),
    )
}

#[contractimpl]
impl Vault {
    /// Fixes the vault's rules at deployment. It runs once, atomically with
    /// the deployment.
    ///
    /// `code_hash` is the SHA-256 of the code in lowercase. `payout` is what
    /// each account receives, in the token's base units (stroops for XLM).
    /// The vault holds nothing until someone transfers the token to its
    /// address.
    ///
    /// Auth: none. Errors: `InvalidPayout` (the deployment fails).
    pub fn __constructor(
        env: Env,
        token: Address,
        code_hash: BytesN<32>,
        payout: i128,
    ) -> Result<(), Error> {
        if payout <= 0 {
            return Err(Error::InvalidPayout);
        }
        env.storage().instance().set(
            &DataKey::Config,
            &Config {
                token,
                code_hash,
                payout,
            },
        );
        env.storage().instance().set(&DataKey::Claims, &0u32);
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
        Ok(())
    }

    /// Pays `payout` of the token to `claimer` when `code` is right. Each
    /// account can claim once. Returns the amount paid.
    ///
    /// State is written before the transfer, so the contract is consistent
    /// whatever the token does.
    ///
    /// Auth: `claimer`. Errors: `WrongCode`, `AlreadyClaimed`, `VaultEmpty`.
    pub fn claim(env: Env, claimer: Address, code: String) -> Result<i128, Error> {
        claimer.require_auth();

        let config = Self::read_config(&env);
        if code_hash(&env, &code) != Some(config.code_hash.clone()) {
            return Err(Error::WrongCode);
        }

        let key = DataKey::Claimed(claimer.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyClaimed);
        }

        let token = token::Client::new(&env, &config.token);
        let vault = env.current_contract_address();
        if token.balance(&vault) < config.payout {
            return Err(Error::VaultEmpty);
        }

        env.storage().persistent().set(&key, &true);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        let claims = Self::get_claims(env.clone()) + 1;
        env.storage().instance().set(&DataKey::Claims, &claims);
        env.storage()
            .instance()
            .extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);

        token.transfer(&vault, &claimer, &config.payout);

        Claimed {
            claimer,
            amount: config.payout,
        }
        .publish(&env);
        Ok(config.payout)
    }

    /// The token, the hash of the code and the payout the vault was opened with.
    pub fn get_config(env: Env) -> Config {
        Self::read_config(&env)
    }

    /// What the vault holds now, in the token's base units.
    pub fn get_balance(env: Env) -> i128 {
        let config = Self::read_config(&env);
        token::Client::new(&env, &config.token).balance(&env.current_contract_address())
    }

    /// Whether `account` already claimed its share.
    pub fn has_claimed(env: Env, account: Address) -> bool {
        env.storage().persistent().has(&DataKey::Claimed(account))
    }

    /// How many accounts have claimed.
    pub fn get_claims(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Claims).unwrap_or(0)
    }
}

impl Vault {
    fn read_config(env: &Env) -> Config {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .expect("the constructor stores the config")
    }
}

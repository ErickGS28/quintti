use soroban_sdk::contracterror;

/// Errors returned by the vault contract.
///
/// Numeric values are part of the public interface (the web app maps them to
/// messages), so they must stay stable once deployed.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// The code does not match the one the vault was opened with.
    WrongCode = 1,
    /// This account already claimed its share.
    AlreadyClaimed = 2,
    /// The vault holds less than one share.
    VaultEmpty = 3,
    /// The payout is zero or negative (the deployment fails).
    InvalidPayout = 4,
}

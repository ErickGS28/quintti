use soroban_sdk::{contracttype, Address, BytesN, String, Symbol, Vec};

/// Maximum number of council members.
pub const MAX_COUNCIL: u32 = 7;
/// Maximum number of budget categories.
pub const MAX_CATEGORIES: u32 = 16;
/// Maximum number of approved vendors.
pub const MAX_VENDORS: u32 = 64;
/// Maximum page size for `get_expenses`.
pub const MAX_PAGE: u32 = 20;
/// Longest building name, in bytes (an accented letter takes two).
pub const MAX_NAME_BYTES: u32 = 80;
/// Longest expense description, in bytes.
pub const MAX_DESCRIPTION_BYTES: u32 = 200;
/// Longest invoice link, in bytes.
pub const MAX_URI_BYTES: u32 = 200;

/// Token and roles. The token never changes. The assembly can replace the
/// administrator and the threshold, and the contract keeps the assembly itself
/// fixed.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    /// Token that the treasury holds and pays with.
    pub token: Address,
    /// Role that sets the rules. It can never move funds.
    pub assembly: Address,
    /// Role that proposes expenses. It can never approve them.
    pub administrator: Address,
    /// Number of council approvals needed to pay an expense.
    pub threshold: u32,
}

/// Annual limit and amount already paid for one category.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BudgetLine {
    pub limit: i128,
    pub spent: i128,
}

/// Lifecycle of an expense. `Paid` and `Cancelled` are final.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ExpenseStatus {
    Pending,
    Paid,
    Cancelled,
}

/// A proposed payment to an approved vendor.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Expense {
    pub id: u32,
    pub category: Symbol,
    pub vendor: Address,
    pub amount: i128,
    /// SHA-256 of the invoice file, computed by the client.
    pub invoice_hash: BytesN<32>,
    /// What the money is for, in the administrator's words. Never empty.
    pub description: String,
    /// Where the invoice file can be fetched, or empty. It is a convenience:
    /// the fingerprint is the proof, not the link.
    pub invoice_uri: String,
    /// Council members that approved, in order. Members removed from the
    /// council after approving no longer count.
    pub approvals: Vec<Address>,
    pub status: ExpenseStatus,
    /// Ledger time when the expense was proposed.
    pub created_at: u64,
    /// Ledger time when the expense was paid.
    pub paid_at: Option<u64>,
}

/// A council rotation the assembly has announced and not yet executed. It can
/// run once the ledger time reaches executable_at, and the assembly can
/// cancel it before that.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PendingRotation {
    pub council: Vec<Address>,
    pub threshold: u32,
    /// Ledger time (seconds) from which the rotation can be executed.
    pub executable_at: u64,
}

/// Typed storage keys.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Config,
    Council,
    Categories,
    Vendors,
    ExpenseCount,
    Budget(Symbol),
    Expense(u32),
    RotationDelay,
    PendingRotation,
    Name,
}

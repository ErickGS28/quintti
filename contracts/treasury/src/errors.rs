use soroban_sdk::contracterror;

/// Errors returned by the treasury contract.
///
/// Numeric values are part of the public interface (clients map them to
/// messages), so they must stay stable once deployed.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// The contract has no configuration yet.
    NotInitialized = 1,
    /// The council is empty, too large or contains duplicates.
    InvalidCouncil = 2,
    /// The threshold is zero or larger than the council.
    InvalidThreshold = 3,
    /// The administrator is also a council member.
    AdministratorInCouncil = 4,
    /// An amount is zero or negative.
    InvalidAmount = 5,
    /// The category has no budget line.
    UnknownCategory = 6,
    /// The maximum number of budget categories was reached.
    TooManyCategories = 7,
    /// The maximum number of approved vendors was reached.
    TooManyVendors = 8,
    /// The new limit is below what the category has already spent.
    BudgetBelowSpent = 9,
    /// The vendor is not on the approved list.
    VendorNotApproved = 10,
    /// The vendor is the assembly, the administrator or a council member.
    VendorIsInsider = 11,
    /// The expense would exceed the category's limit.
    OverBudget = 12,
    /// No expense exists with that id.
    ExpenseNotFound = 13,
    /// The expense is already paid or cancelled.
    ExpenseNotPending = 14,
    /// The caller is not a current council member.
    NotCouncilMember = 15,
    /// The council member already approved this expense.
    AlreadyApproved = 16,
    /// The caller may not perform this action.
    NotAuthorized = 17,
    /// The treasury balance does not cover the payment.
    InsufficientBalance = 18,
    /// A checked arithmetic operation overflowed.
    Overflow = 19,
    /// The treasury was deployed with a rotation delay, so the council can only
    /// change through nnounce_rotation and execute_rotation.
    RotationDelayRequired = 20,
    /// A rotation is already announced. Cancel it before announcing another.
    RotationAlreadyPending = 21,
    /// There is no announced rotation.
    NoPendingRotation = 22,
    /// The announced rotation cannot run yet: its delay has not passed.
    RotationNotReady = 23,
    /// A name, description or invoice link is longer than its limit.
    TextTooLong = 24,
    /// A building name or an expense description is empty.
    EmptyText = 25,
}

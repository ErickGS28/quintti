//! Pure rules. They take values and return results, with no storage access,
//! so they are easy to test and to reason about.

use soroban_sdk::{Address, Vec};

use crate::errors::Error;
use crate::types::{BudgetLine, MAX_COUNCIL, MAX_VENDORS};

/// Checks the council and the threshold, and that nobody approves their own
/// proposals (the administrator is never a council member).
///
/// Errors: `InvalidCouncil`, `InvalidThreshold`, `AdministratorInCouncil`.
pub fn validate_governance(
    administrator: &Address,
    council: &Vec<Address>,
    threshold: u32,
) -> Result<(), Error> {
    let size = council.len();
    if size == 0 || size > MAX_COUNCIL || has_duplicates(council)? {
        return Err(Error::InvalidCouncil);
    }
    if threshold == 0 || threshold > size {
        return Err(Error::InvalidThreshold);
    }
    if council.contains(administrator) {
        return Err(Error::AdministratorInCouncil);
    }
    Ok(())
}

/// Council sizes are bounded by `MAX_COUNCIL`, so the quadratic scan is cheap.
fn has_duplicates(addresses: &Vec<Address>) -> Result<bool, Error> {
    for i in 0..addresses.len() {
        let current = addresses.get(i).ok_or(Error::InvalidCouncil)?;
        for j in (i + 1)..addresses.len() {
            if addresses.get(j).ok_or(Error::InvalidCouncil)? == current {
                return Ok(true);
            }
        }
    }
    Ok(false)
}

/// A vendor must not be able to pay itself: the assembly, the administrator
/// and the council members are all excluded.
pub fn is_insider(
    address: &Address,
    assembly: &Address,
    administrator: &Address,
    council: &Vec<Address>,
) -> bool {
    address == assembly || address == administrator || council.contains(address)
}

/// Builds the budget line for a category limit. A limit cannot drop below what
/// the category has already paid.
///
/// Errors: `InvalidAmount`, `BudgetBelowSpent`.
pub fn updated_budget(existing: Option<&BudgetLine>, limit: i128) -> Result<BudgetLine, Error> {
    if limit <= 0 {
        return Err(Error::InvalidAmount);
    }
    let spent = existing.map_or(0, |line| line.spent);
    if limit < spent {
        return Err(Error::BudgetBelowSpent);
    }
    Ok(BudgetLine { limit, spent })
}

/// Adds a vendor. Adding one that is already approved changes nothing.
///
/// Errors: `TooManyVendors`.
pub fn with_vendor(mut vendors: Vec<Address>, vendor: &Address) -> Result<Vec<Address>, Error> {
    if vendors.contains(vendor) {
        return Ok(vendors);
    }
    if vendors.len() >= MAX_VENDORS {
        return Err(Error::TooManyVendors);
    }
    vendors.push_back(vendor.clone());
    Ok(vendors)
}

/// Removes a vendor. Removing one that is not approved changes nothing.
pub fn without_vendor(mut vendors: Vec<Address>, vendor: &Address) -> Vec<Address> {
    if let Some(index) = vendors.first_index_of(vendor) {
        vendors.remove(index);
    }
    vendors
}

/// Checks that paying `amount` keeps the category within its limit.
///
/// Errors: `OverBudget`, `Overflow`.
pub fn check_budget(line: &BudgetLine, amount: i128) -> Result<(), Error> {
    let total = line.spent.checked_add(amount).ok_or(Error::Overflow)?;
    if total > line.limit {
        return Err(Error::OverBudget);
    }
    Ok(())
}

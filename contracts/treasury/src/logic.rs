//! Pure rules. They take values and return results, with no storage access,
//! so they are easy to test and to reason about.

use soroban_sdk::{Address, Vec};

use crate::errors::Error;
use crate::types::MAX_COUNCIL;

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

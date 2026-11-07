use soroban_sdk::testutils::Address as _;
use soroban_sdk::Address;

use super::setup::{without_auths, Fixture};
use crate::{Error, MAX_VENDORS};

#[test]
fn set_vendor_approves_a_vendor() {
    let f = Fixture::new();
    let vendor = Address::generate(&f.env);
    assert!(!f.treasury.is_vendor(&vendor));

    f.treasury.set_vendor(&vendor, &true);

    assert!(f.treasury.is_vendor(&vendor));
    assert_eq!(f.treasury.list_vendors().len(), 1);
}

#[test]
fn set_vendor_approving_twice_keeps_a_single_entry() {
    let f = Fixture::new();
    let vendor = Address::generate(&f.env);

    f.treasury.set_vendor(&vendor, &true);
    f.treasury.set_vendor(&vendor, &true);

    assert_eq!(f.treasury.list_vendors().len(), 1);
}

#[test]
fn set_vendor_removes_an_approved_vendor() {
    let f = Fixture::new();
    let kept = Address::generate(&f.env);
    let removed = Address::generate(&f.env);
    f.treasury.set_vendor(&kept, &true);
    f.treasury.set_vendor(&removed, &true);

    f.treasury.set_vendor(&removed, &false);

    assert!(!f.treasury.is_vendor(&removed));
    assert!(f.treasury.is_vendor(&kept));
}

#[test]
fn set_vendor_removing_an_unknown_vendor_changes_nothing() {
    let f = Fixture::new();
    let kept = Address::generate(&f.env);
    f.treasury.set_vendor(&kept, &true);

    f.treasury.set_vendor(&Address::generate(&f.env), &false);

    assert_eq!(f.treasury.list_vendors().len(), 1);
}

#[test]
fn set_vendor_rejects_the_assembly_the_administrator_and_council_members() {
    let f = Fixture::new();

    assert_eq!(
        f.treasury.try_set_vendor(&f.assembly, &true),
        Err(Ok(Error::VendorIsInsider))
    );
    assert_eq!(
        f.treasury.try_set_vendor(&f.administrator, &true),
        Err(Ok(Error::VendorIsInsider))
    );
    for member in &f.council {
        assert_eq!(
            f.treasury.try_set_vendor(member, &true),
            Err(Ok(Error::VendorIsInsider))
        );
    }
    assert_eq!(f.treasury.list_vendors().len(), 0);
}

#[test]
fn set_vendor_rejects_more_vendors_than_the_maximum() {
    let f = Fixture::new();
    for _ in 0..MAX_VENDORS {
        f.treasury.set_vendor(&Address::generate(&f.env), &true);
    }

    let result = f.treasury.try_set_vendor(&Address::generate(&f.env), &true);

    assert_eq!(result, Err(Ok(Error::TooManyVendors)));
    assert_eq!(f.treasury.list_vendors().len(), MAX_VENDORS);
}

#[test]
fn set_vendor_asks_for_the_assemblys_signature_only() {
    let f = Fixture::new();

    f.treasury.set_vendor(&Address::generate(&f.env), &true);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.assembly);
}

#[test]
fn set_vendor_fails_without_a_signature() {
    let (env, treasury) = without_auths();

    assert!(treasury
        .try_set_vendor(&Address::generate(&env), &true)
        .is_err());
}

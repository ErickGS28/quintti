use super::setup::{maintenance, numbered_category, without_auths, Fixture};
use crate::{BudgetLine, Error, MAX_CATEGORIES};

#[test]
fn set_budget_creates_a_category_with_nothing_spent() {
    let f = Fixture::new();
    let category = maintenance(&f.env);

    f.treasury.set_budget(&category, &10_000);

    assert_eq!(
        f.treasury.get_budget(&category),
        Some(BudgetLine {
            limit: 10_000,
            spent: 0
        })
    );
    assert_eq!(f.treasury.list_categories().len(), 1);
}

#[test]
fn set_budget_changes_the_limit_without_duplicating_the_category() {
    let f = Fixture::new();
    let category = maintenance(&f.env);
    f.treasury.set_budget(&category, &10_000);

    f.treasury.set_budget(&category, &25_000);

    assert_eq!(f.treasury.get_budget(&category).unwrap().limit, 25_000);
    assert_eq!(f.treasury.list_categories().len(), 1);
}

#[test]
fn get_budget_is_empty_for_an_unknown_category() {
    let f = Fixture::new();

    assert_eq!(f.treasury.get_budget(&maintenance(&f.env)), None);
}

#[test]
fn set_budget_rejects_a_zero_or_negative_limit() {
    let f = Fixture::new();
    let category = maintenance(&f.env);

    assert_eq!(
        f.treasury.try_set_budget(&category, &0),
        Err(Ok(Error::InvalidAmount))
    );
    assert_eq!(
        f.treasury.try_set_budget(&category, &-1),
        Err(Ok(Error::InvalidAmount))
    );
}

#[test]
fn set_budget_rejects_more_categories_than_the_maximum() {
    let f = Fixture::new();
    for index in 0..MAX_CATEGORIES as usize {
        f.treasury
            .set_budget(&numbered_category(&f.env, index), &1_000);
    }

    let result = f
        .treasury
        .try_set_budget(&numbered_category(&f.env, MAX_CATEGORIES as usize), &1_000);

    assert_eq!(result, Err(Ok(Error::TooManyCategories)));
    assert_eq!(f.treasury.list_categories().len(), MAX_CATEGORIES);
}

#[test]
fn set_budget_still_updates_an_existing_category_at_the_maximum() {
    let f = Fixture::new();
    for index in 0..MAX_CATEGORIES as usize {
        f.treasury
            .set_budget(&numbered_category(&f.env, index), &1_000);
    }

    f.treasury.set_budget(&numbered_category(&f.env, 0), &2_000);

    let line = f.treasury.get_budget(&numbered_category(&f.env, 0));
    assert_eq!(line.unwrap().limit, 2_000);
}

#[test]
fn set_budget_asks_for_the_assemblys_signature_only() {
    let f = Fixture::new();

    f.treasury.set_budget(&maintenance(&f.env), &10_000);

    let auths = f.env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, f.assembly);
}

#[test]
fn set_budget_fails_without_a_signature() {
    let (env, treasury) = without_auths();

    assert!(treasury
        .try_set_budget(&maintenance(&env), &10_000)
        .is_err());
}

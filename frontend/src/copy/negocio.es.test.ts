import { describe, expect, it } from "vitest";

import { negocioCopy, PRICING_EXAMPLE } from "./negocio.es";

/** Every string in the copy, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("business model copy", () => {
  it("states figures that follow from the example", () => {
    const moved = PRICING_EXAMPLE.apartments * PRICING_EXAMPLE.monthlyFee;
    const price = PRICING_EXAMPLE.apartments * PRICING_EXAMPLE.pricePerApartment;

    expect(moved).toBe(12_000_000);
    expect(price).toBe(80_000);
    // The page says the price is under 1 % of what the building moves.
    expect(price / moved).toBeLessThan(0.01);
    expect(negocioCopy.model.moved.value).toContain("12.000.000");
    expect(negocioCopy.model.price.value).toContain("80.000");
  });

  it("gives each screen a distinct id for the menu and the pager", () => {
    const ids = [negocioCopy.model.id, negocioCopy.income.id, negocioCopy.plan.id, negocioCopy.follow.id];

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+$/);
  });

  it("lays out three income sources and four roadmap steps, each with a horizon", () => {
    expect(negocioCopy.income.items).toHaveLength(3);
    expect(negocioCopy.plan.steps).toHaveLength(4);
    for (const step of negocioCopy.plan.steps) expect(step.horizon.trim()).not.toBe("");
  });

  it("says the numbers are assumptions", () => {
    expect(negocioCopy.model.note).toMatch(/por validar/);
    expect(negocioCopy.plan.lead).toMatch(/estimados/);
  });

  it("has no empty text and no leftover placeholders", () => {
    for (const text of strings(negocioCopy)) {
      expect(text, text).not.toMatch(/\bTODO\b|lorem ipsum|\bundefined\b|\{\{/);
      expect(text, text).toBe(text.trim());
    }
  });
});

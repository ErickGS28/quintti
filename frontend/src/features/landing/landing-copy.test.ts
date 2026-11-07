import { describe, expect, it } from "vitest";

import { landingCopy } from "@/copy/landing.es";

import { DEMO_STEPS } from "./demo/demo-flow";

const { problem, solution, example, why, faq } = landingCopy;

/** Every string in the copy, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("landing copy", () => {
  it("gives each section a distinct id, because the menu and the buttons link to them", () => {
    const ids = [problem.id, solution.id, example.id, why.id, faq.id];

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+$/);
  });

  it("has a caption and an action for every step of the example", () => {
    for (const step of DEMO_STEPS) {
      expect(example.steps[step].caption.trim(), step).not.toBe("");
      expect(example.steps[step].action.trim(), step).not.toBe("");
    }
    expect(Object.keys(example.steps)).toHaveLength(DEMO_STEPS.length);
  });

  it("tells the flow in four steps and three rules, which the illustrations match", () => {
    expect(solution.steps).toHaveLength(4);
    expect(solution.rules).toHaveLength(3);
  });

  it("compares a normal app with Stellar on the same questions", () => {
    expect(why.compare.rows.length).toBeGreaterThanOrEqual(3);
    for (const row of why.compare.rows) {
      expect(row.web2.trim()).not.toBe("");
      expect(row.stellar.trim()).not.toBe("");
    }
  });

  it("has no empty text and no leftover placeholders", () => {
    for (const text of strings(landingCopy)) {
      if (text === "") continue;
      expect(text, text).not.toMatch(/\bTODO\b|lorem ipsum|\bundefined\b|\{\{/);
      expect(text, text).toBe(text.trim());
    }
  });

  it("states the limits: it is a testnet prototype and not a replacement for the law", () => {
    const text = strings(landingCopy.footer).join(" ");

    expect(text).toMatch(/red de pruebas/);
    expect(text).toMatch(/no sustituye/);
  });
});

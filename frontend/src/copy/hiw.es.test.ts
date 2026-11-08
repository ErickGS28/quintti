import { describe, expect, it } from "vitest";

import { permissionsOf, type TreasuryRole } from "@/lib/treasury/roles";

import { hiwCopy } from "./hiw.es";

/** Every string in the copy, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("manual copy", () => {
  it("links every table-of-contents entry to a section that exists", () => {
    const sections = [
      hiwCopy.rules.id,
      hiwCopy.roles.id,
      hiwCopy.flow.id,
      hiwCopy.screens.id,
      hiwCopy.trial.id,
      hiwCopy.glossary.id,
      hiwCopy.limits.id,
    ];

    expect(hiwCopy.toc.map((entry) => entry.id)).toEqual(sections);
    expect(new Set(sections).size).toBe(sections.length);
  });

  it("describes every role the app knows, plus the resident and the vendor", () => {
    const keys: string[] = hiwCopy.roles.items.map((role) => role.key);

    for (const role of ["assembly", "administrator", "council"] satisfies TreasuryRole[]) {
      expect(keys).toContain(role);
    }
    expect(keys).toContain("resident");
    expect(keys).toContain("vendor");
  });

  it("agrees with what the app lets each role do", () => {
    // The manual says who proposes, approves and changes rules; the permissions decide it in the app.
    expect(permissionsOf(["administrator"])).toMatchObject({ canPropose: true, canApprove: false, canManageRules: false });
    expect(permissionsOf(["council"])).toMatchObject({ canPropose: false, canApprove: true, canManageRules: false });
    expect(permissionsOf(["assembly"])).toMatchObject({ canPropose: false, canApprove: false, canManageRules: true });
    expect(permissionsOf([])).toMatchObject({ canPropose: false, canApprove: false, canCancel: false, canManageRules: false });
  });

  it("tells the flow in order and gives every step an actor", () => {
    expect(hiwCopy.flow.steps.length).toBeGreaterThanOrEqual(4);
    for (const step of hiwCopy.flow.steps) {
      expect(step.who.trim()).not.toBe("");
      expect(step.body.trim()).not.toBe("");
    }
  });

  it("has no empty text and no leftover placeholders", () => {
    for (const text of strings(hiwCopy)) {
      expect(text, text).not.toMatch(/\bTODO\b|lorem ipsum|\bundefined\b|\{\{/);
      expect(text, text).toBe(text.trim());
    }
  });
});

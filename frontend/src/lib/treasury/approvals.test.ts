import { describe, expect, it } from "vitest";

import { approvalProgress, fitsBudget, spentShare } from "./approvals";

const council = ["GA", "GB", "GC"];

describe("approval progress", () => {
  it("counts only current council members, like the contract", () => {
    expect(approvalProgress(["GA", "GOLD"], council, 2)).toEqual({
      valid: 1,
      needed: 2,
      missing: 1,
      stale: ["GOLD"],
    });
  });

  it("never reports a negative number of missing approvals", () => {
    expect(approvalProgress(["GA", "GB", "GC"], council, 2).missing).toBe(0);
  });

  it("starts with nothing approved", () => {
    expect(approvalProgress([], council, 2)).toEqual({ valid: 0, needed: 2, missing: 2, stale: [] });
  });
});

describe("budget fit", () => {
  const line = { limit: 10_000_000n, spent: 8_000_000n };

  it("accepts an amount up to what is left", () => {
    expect(fitsBudget(2_000_000n, line)).toBe(true);
  });

  it("rejects an amount above what is left, and zero", () => {
    expect(fitsBudget(2_000_001n, line)).toBe(false);
    expect(fitsBudget(0n, line)).toBe(false);
  });

  it("reports the spent share between 0 and 1", () => {
    expect(spentShare(line)).toBe(0.8);
    expect(spentShare({ limit: 0n, spent: 0n })).toBe(0);
    expect(spentShare({ limit: 10n, spent: 20n })).toBe(1);
  });
});

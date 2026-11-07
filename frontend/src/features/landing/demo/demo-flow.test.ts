import { describe, expect, it } from "vitest";

import {
  DEMO_AMOUNTS,
  DEMO_STEPS,
  DEMO_THRESHOLD,
  exceedsBudget,
  formatPesos,
  nextStep,
  stepNumber,
  viewOf,
} from "./demo-flow";

describe("nextStep", () => {
  it("walks through every step in order and starts over after the last", () => {
    const visited = [DEMO_STEPS[0]];
    for (let index = 1; index <= DEMO_STEPS.length; index += 1) visited.push(nextStep(visited[index - 1]));

    expect(visited).toEqual([...DEMO_STEPS, DEMO_STEPS[0]]);
  });

  it("numbers the steps from 1", () => {
    expect(DEMO_STEPS.map(stepNumber)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("exceedsBudget", () => {
  it("allows an amount equal to what is left and rejects one peso more", () => {
    expect(exceedsBudget(100, 100)).toBe(false);
    expect(exceedsBudget(100, 101)).toBe(true);
  });
});

describe("viewOf", () => {
  it("starts with nothing spent and nothing on the public page", () => {
    expect(viewOf("idle")).toMatchObject({
      balance: DEMO_AMOUNTS.initialBalance,
      spent: 0,
      remaining: DEMO_AMOUNTS.budget,
      approvals: 0,
      firstExpense: "none",
      secondExpense: "none",
      ledger: [],
    });
  });

  it("keeps the money in place until the expense reaches the threshold", () => {
    for (const step of ["proposed", "firstApproval"] as const) {
      expect(viewOf(step)).toMatchObject({ spent: 0, balance: DEMO_AMOUNTS.initialBalance, firstExpense: "pending" });
    }
    expect(viewOf("proposed").approvals).toBe(0);
    expect(viewOf("firstApproval").approvals).toBe(1);
  });

  it("pays when the second signature arrives", () => {
    const view = viewOf("paid");

    expect(view.approvals).toBe(DEMO_THRESHOLD);
    expect(view.firstExpense).toBe("paid");
    expect(view.spent).toBe(DEMO_AMOUNTS.firstExpense);
    expect(view.balance).toBe(DEMO_AMOUNTS.initialBalance - DEMO_AMOUNTS.firstExpense);
    expect(view.remaining).toBe(DEMO_AMOUNTS.budget - DEMO_AMOUNTS.firstExpense);
  });

  it("rejects the second expense because it exceeds what is left, and spends nothing more", () => {
    const view = viewOf("blocked");

    expect(view.secondExpense).toBe("rejected");
    expect(view.spent).toBe(DEMO_AMOUNTS.firstExpense);
    expect(view.balance).toBe(viewOf("paid").balance);
    expect(DEMO_AMOUNTS.secondExpense).toBeGreaterThan(view.remaining);
  });

  it("records each event on the public ledger in order", () => {
    expect(viewOf("proposed").ledger).toEqual([{ kind: "proposed" }]);
    expect(viewOf("firstApproval").ledger).toEqual([
      { kind: "proposed" },
      { kind: "approved", signer: 0 },
    ]);
    expect(viewOf("blocked").ledger.map((entry) => entry.kind)).toEqual([
      "proposed",
      "approved",
      "approved",
      "paid",
      "rejected",
    ]);
  });

  it("never lets spending exceed the budget at any step", () => {
    for (const step of DEMO_STEPS) {
      expect(viewOf(step).spent).toBeLessThanOrEqual(DEMO_AMOUNTS.budget);
    }
  });
});

describe("formatPesos", () => {
  it("separates thousands with dots", () => {
    expect(formatPesos(8_000_000)).toBe("$8.000.000");
    expect(formatPesos(0)).toBe("$0");
  });
});

/**
 * The illustrative walk-through on the landing page: an elevator repair that is paid, and a second
 * repair that the rules reject. It models the same rule as the contract (an expense that exceeds
 * what is left of its category is rejected) with fixed, made-up amounts. No network is involved.
 */

export type DemoStep = "idle" | "proposed" | "firstApproval" | "paid" | "blocked";

export const DEMO_STEPS: readonly DemoStep[] = ["idle", "proposed", "firstApproval", "paid", "blocked"];

/** Illustrative amounts in pesos. */
export const DEMO_AMOUNTS = {
  initialBalance: 24_000_000,
  budget: 10_000_000,
  firstExpense: 8_000_000,
  secondExpense: 5_000_000,
} as const;

/** Approvals needed to pay, as in the council of 2 out of 3. */
export const DEMO_THRESHOLD = 2;

export type LedgerEntry =
  | { kind: "proposed" }
  | { kind: "approved"; signer: number }
  | { kind: "paid" }
  | { kind: "rejected" };

export interface DemoView {
  balance: number;
  spent: number;
  remaining: number;
  approvals: number;
  firstExpense: "none" | "pending" | "paid";
  secondExpense: "none" | "rejected";
  /** What a neighbor sees on the public page, oldest first. */
  ledger: LedgerEntry[];
}

/** Moves to the next step. After the last one the walk-through starts over. */
export function nextStep(step: DemoStep): DemoStep {
  const index = DEMO_STEPS.indexOf(step);
  return DEMO_STEPS[(index + 1) % DEMO_STEPS.length];
}

/** Position of a step, starting at 1, for a "step 2 of 5" label. */
export function stepNumber(step: DemoStep): number {
  return DEMO_STEPS.indexOf(step) + 1;
}

/** The contract's budget rule: a payment may not exceed what is left of its category. */
export function exceedsBudget(remaining: number, amount: number): boolean {
  return amount > remaining;
}

/** Everything the walk-through shows at a given step. */
export function viewOf(step: DemoStep): DemoView {
  const index = DEMO_STEPS.indexOf(step);
  const proposed = index >= DEMO_STEPS.indexOf("proposed");
  const approvals = Math.min(Math.max(index - DEMO_STEPS.indexOf("proposed"), 0), DEMO_THRESHOLD);
  const paid = approvals >= DEMO_THRESHOLD;

  const spent = paid ? DEMO_AMOUNTS.firstExpense : 0;
  const remaining = DEMO_AMOUNTS.budget - spent;
  const secondAttempted = step === "blocked";

  const ledger: LedgerEntry[] = [];
  if (proposed) ledger.push({ kind: "proposed" });
  for (let signer = 0; signer < approvals; signer += 1) ledger.push({ kind: "approved", signer });
  if (paid) ledger.push({ kind: "paid" });
  const rejected = secondAttempted && exceedsBudget(remaining, DEMO_AMOUNTS.secondExpense);
  if (rejected) ledger.push({ kind: "rejected" });

  return {
    balance: DEMO_AMOUNTS.initialBalance - spent,
    spent,
    remaining,
    approvals,
    firstExpense: paid ? "paid" : proposed ? "pending" : "none",
    secondExpense: rejected ? "rejected" : "none",
    ledger,
  };
}

/** Pesos with dots as thousands separators, for example `$8.000.000`. */
export function formatPesos(amount: number): string {
  return `$${new Intl.NumberFormat("es-CO").format(amount)}`;
}

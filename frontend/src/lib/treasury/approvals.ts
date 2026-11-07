export interface ApprovalProgress {
  /** Approvals from members who are on the council today. Only these count, as in the contract. */
  valid: number;
  /** Approvals the contract needs to pay. */
  needed: number;
  /** Approvals still missing, never below zero. */
  missing: number;
  /** Approvals from people who have since left the council. Kept for the record, not counted. */
  stale: string[];
}

/**
 * How far an expense is from being paid, counted the way the contract counts it: only approvals
 * from current council members, against the current threshold.
 */
export function approvalProgress(
  approvals: readonly string[],
  council: readonly string[],
  threshold: number,
): ApprovalProgress {
  const valid = approvals.filter((approver) => council.includes(approver)).length;
  return {
    valid,
    needed: threshold,
    missing: Math.max(0, threshold - valid),
    stale: approvals.filter((approver) => !council.includes(approver)),
  };
}

/** Whether `amount` still fits what is left of a budget line. The contract checks it again at payment. */
export function fitsBudget(amount: bigint, line: { limit: bigint; spent: bigint }): boolean {
  return amount > 0n && line.spent + amount <= line.limit;
}

/** Share of a budget line already spent, from 0 to 1, for progress bars. */
export function spentShare(line: { limit: bigint; spent: bigint }): number {
  if (line.limit <= 0n) return 0;
  // Basis points keep the division in integers until the very end.
  const basisPoints = (line.spent * 10_000n) / line.limit;
  return Math.min(1, Math.max(0, Number(basisPoints) / 10_000));
}

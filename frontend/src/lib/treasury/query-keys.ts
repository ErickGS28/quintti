/**
 * Cache keys for everything read from the treasury. Writes invalidate
 * `treasuryKeys.all`, so every view refreshes after any change.
 */
export const treasuryKeys = {
  all: ["treasury"] as const,
  snapshot: () => [...treasuryKeys.all, "snapshot"] as const,
  expenses: () => [...treasuryKeys.all, "expenses"] as const,
};

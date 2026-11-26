/**
 * Cache keys for everything read from a treasury. Each building has its own keys, so switching building
 * never shows another one's data. Writes invalidate `treasuryKeys.all`, so every view refreshes after any change.
 */
export const treasuryKeys = {
  all: ["treasury"] as const,
  building: (contractId: string) => [...treasuryKeys.all, contractId] as const,
  snapshot: (contractId: string) => [...treasuryKeys.building(contractId), "snapshot"] as const,
  expenses: (contractId: string) => [...treasuryKeys.building(contractId), "expenses"] as const,
  name: (contractId: string) => [...treasuryKeys.building(contractId), "name"] as const,
  /** What an account holds of the building's token. Under `all`, so a deposit refreshes it too. */
  tokenBalance: (token: string, address: string) => [...treasuryKeys.all, "token-balance", token, address] as const,
};
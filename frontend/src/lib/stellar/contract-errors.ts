/**
 * Names of the errors the treasury contract can return, in the order of their
 * numeric codes (1 to 19). A test checks this list against the generated
 * bindings, so a change in the contract cannot go unnoticed.
 */
export const CONTRACT_ERROR_NAMES = [
  "NotInitialized",
  "InvalidCouncil",
  "InvalidThreshold",
  "AdministratorInCouncil",
  "InvalidAmount",
  "UnknownCategory",
  "TooManyCategories",
  "TooManyVendors",
  "BudgetBelowSpent",
  "VendorNotApproved",
  "VendorIsInsider",
  "OverBudget",
  "ExpenseNotFound",
  "ExpenseNotPending",
  "NotCouncilMember",
  "AlreadyApproved",
  "NotAuthorized",
  "InsufficientBalance",
  "Overflow",
] as const;

export type ContractErrorName = (typeof CONTRACT_ERROR_NAMES)[number];

export function isContractErrorName(value: string): value is ContractErrorName {
  return (CONTRACT_ERROR_NAMES as readonly string[]).includes(value);
}

/** Error codes start at 1, so the code `n` is the name at position `n - 1`. */
export function contractErrorName(code: number): ContractErrorName | undefined {
  return CONTRACT_ERROR_NAMES[code - 1];
}

/**
 * Finds the contract error code inside an RPC or SDK message such as
 * `HostError: Error(Contract, #12)`.
 */
export function findContractErrorCode(message: string): number | undefined {
  const match = /Error\(Contract, #(\d+)\)/.exec(message);
  return match ? Number(match[1]) : undefined;
}

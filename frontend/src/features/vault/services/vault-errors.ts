import { AppError } from "@/lib/errors/app-error";
import { findContractErrorCode } from "@/lib/stellar/contract-errors";
import { toAppError } from "@/lib/stellar/to-app-error";

/**
 * Names of the errors the vault contract can return, in the order of their numeric codes (1 to 4). The
 * treasury has its own table with the same numbers, so a code read with the wrong table names the wrong
 * rule: the vault's errors are read here and never with the treasury's list. A test checks this list against
 * the generated bindings.
 */
export const VAULT_ERROR_NAMES = ["WrongCode", "AlreadyClaimed", "VaultEmpty", "InvalidPayout"] as const;

export type VaultErrorName = (typeof VAULT_ERROR_NAMES)[number];

export function isVaultErrorName(value: string | undefined): value is VaultErrorName {
  return (VAULT_ERROR_NAMES as readonly string[]).includes(value ?? "");
}

/** Error codes start at 1, so the code `n` is the name at position `n - 1`. */
export function vaultErrorName(code: number): VaultErrorName | undefined {
  return VAULT_ERROR_NAMES[code - 1];
}

/**
 * Turns anything thrown while claiming into an `AppError`. A code in the message belongs to the vault (a
 * failure inside another contract was already made an `other-contract` error before it got here), so it is
 * named with the vault's table. Everything else is the usual `toAppError`.
 */
export function toVaultError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const code = findContractErrorCode(message);
  if (code !== undefined) {
    const name = vaultErrorName(code);
    return new AppError("contract", name ? `The vault rejected the call: ${name}` : "The vault rejected the call", {
      contractError: name,
      cause: error,
    });
  }
  return toAppError(error);
}

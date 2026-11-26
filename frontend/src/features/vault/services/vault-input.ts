import { AppError } from "@/lib/errors/app-error";

/** Matches the contract's `MAX_CODE_BYTES`: a longer text cannot be the code. */
export const CODE_MAX_BYTES = 64;

/**
 * The code as it is sent: without the spaces people leave around what they paste. The contract ignores
 * upper and lower case, so the case is left as typed.
 *
 * Errors: `AppError` of kind `invalid-input`, field `code`.
 */
export function validateCode(text: string): string {
  const code = text.trim();
  if (!code) throw new AppError("invalid-input", "The code is empty", { field: "code" });
  if (new TextEncoder().encode(code).length > CODE_MAX_BYTES) {
    throw new AppError("invalid-input", "The code is too long", { field: "code" });
  }
  return code;
}

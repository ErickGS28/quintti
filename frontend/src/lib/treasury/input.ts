import { StrKey } from "@stellar/stellar-sdk";

import { INVOICE_MAX_BYTES, MAX_AMOUNT } from "@/config/constants";
import { AppError } from "@/lib/errors/app-error";

function invalid(field: string, message: string): AppError {
  return new AppError("invalid-input", message, { field });
}

/**
 * A budget category is stored as a Soroban `Symbol`: up to 32 letters, digits
 * or underscores.
 *
 * Errors: `AppError` of kind `invalid-input`, field `category`.
 */
export function validateCategory(text: string): string {
  const category = text.trim();
  if (!/^[A-Za-z0-9_]{1,32}$/.test(category)) {
    throw invalid("category", "A category is 1 to 32 letters, digits or underscores");
  }
  return category;
}

/**
 * A Stellar account (starts with G) or contract (starts with C) address.
 *
 * Errors: `AppError` of kind `invalid-input`, with the given field name.
 */
export function validateAddress(text: string, field: string): string {
  const address = text.trim();
  if (!StrKey.isValidEd25519PublicKey(address) && !StrKey.isValidContract(address)) {
    throw invalid(field, "Not a valid Stellar address");
  }
  return address;
}

/**
 * An amount in base units: positive and within what the contract can hold.
 *
 * Errors: `AppError` of kind `invalid-input`, with the given field name.
 */
export function validateAmount(amount: bigint, field = "amount"): bigint {
  if (amount <= 0n || amount > MAX_AMOUNT) {
    throw invalid(field, "The amount must be greater than zero");
  }
  return amount;
}

/**
 * The invoice file whose fingerprint goes on-chain.
 *
 * Errors: `AppError` of kind `invalid-input`, field `invoice`.
 */
export function validateInvoice(file: Blob): Blob {
  if (file.size === 0) {
    throw invalid("invoice", "The invoice file is empty");
  }
  if (file.size > INVOICE_MAX_BYTES) {
    throw invalid("invoice", `The invoice file is larger than ${INVOICE_MAX_BYTES} bytes`);
  }
  return file;
}

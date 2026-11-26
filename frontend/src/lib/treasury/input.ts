import { StrKey } from "@stellar/stellar-sdk";

import {
  DESCRIPTION_MAX_BYTES,
  INVOICE_MAX_BYTES,
  INVOICE_URI_MAX_BYTES,
  MAX_AMOUNT,
  NAME_MAX_BYTES,
} from "@/config/constants";
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

const MAX_U32 = 4_294_967_295;

/**
 * An expense id or any other whole number the contract stores as `u32`.
 *
 * Errors: `AppError` of kind `invalid-input`, with the given field name.
 */
export function validateWholeNumber(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_U32) {
    throw invalid(field, "Expected a whole number from 0 to 4,294,967,295");
  }
  return value;
}

const utf8Bytes = (text: string) => new TextEncoder().encode(text).length;

/** A text the contract needs: not empty and within `max` UTF-8 bytes (an accented letter takes two). */
function validateRequiredText(text: string, field: string, max: number, empty: string): string {
  const value = text.trim();
  if (!value) throw invalid(field, empty);
  if (utf8Bytes(value) > max) throw invalid(field, `Too long: at most ${max} bytes`);
  return value;
}

/**
 * The building's name.
 *
 * Errors: `AppError` of kind `invalid-input`, field `name`.
 */
export function validateName(text: string): string {
  return validateRequiredText(text, "name", NAME_MAX_BYTES, "The building needs a name");
}

/**
 * What an expense is for.
 *
 * Errors: `AppError` of kind `invalid-input`, field `description`.
 */
export function validateDescription(text: string): string {
  return validateRequiredText(text, "description", DESCRIPTION_MAX_BYTES, "Say what the expense is for");
}

/**
 * An optional link to the invoice file: empty, or an http(s) address that fits on-chain.
 *
 * Errors: `AppError` of kind `invalid-input`, field `invoiceUri`.
 */
export function validateInvoiceUri(text: string): string {
  const value = text.trim();
  if (!value) return "";
  if (utf8Bytes(value) > INVOICE_URI_MAX_BYTES) {
    throw invalid("invoiceUri", `The link is too long: at most ${INVOICE_URI_MAX_BYTES} bytes`);
  }
  let protocol: string;
  try {
    protocol = new URL(value).protocol;
  } catch {
    throw invalid("invoiceUri", "The link is not a valid address");
  }
  if (protocol !== "http:" && protocol !== "https:") {
    throw invalid("invoiceUri", "The link must start with http:// or https://");
  }
  return value;
}

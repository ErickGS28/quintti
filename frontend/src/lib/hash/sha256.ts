/** Thrown when text is not a valid 32-byte hash in hexadecimal. */
export class HashFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HashFormatError";
  }
}

const HASH_BYTES = 32;

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Reads 64 hexadecimal characters as a 32-byte hash.
 *
 * Errors: `HashFormatError`.
 */
export function fromHex(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new HashFormatError(`A hash is ${HASH_BYTES * 2} hexadecimal characters`);
  }
  return Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));
}

export function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  return left.length === right.length && left.every((byte, index) => byte === right[index]);
}

/** SHA-256 of raw bytes, computed with the browser's Web Crypto API. */
export async function sha256(data: BufferSource): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

/**
 * The fingerprint of an invoice file. This is the value the contract stores
 * as `invoice_hash`. The file itself never leaves the browser.
 */
export async function hashFile(file: Blob): Promise<Uint8Array> {
  return sha256(await file.arrayBuffer());
}

/**
 * Whether a file is the one an expense was proposed with.
 * `storedHash` is the contract's `invoice_hash`, as bytes or as hexadecimal.
 *
 * Errors: `HashFormatError` when `storedHash` is a string that is not valid hexadecimal.
 */
export async function matchesInvoice(file: Blob, storedHash: Uint8Array | string): Promise<boolean> {
  const stored = typeof storedHash === "string" ? fromHex(storedHash) : storedHash;
  return bytesEqual(await hashFile(file), stored);
}

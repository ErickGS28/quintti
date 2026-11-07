import { describe, expect, it } from "vitest";

import {
  bytesEqual,
  fromHex,
  HashFormatError,
  hashFile,
  matchesInvoice,
  sha256,
  toHex,
} from "./sha256";

const encoder = new TextEncoder();
const ABC_HASH = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
// The invoice hash used in the testnet walkthrough (`docs/06-getting-started.md`).
const SAMPLE_INVOICE_HASH = "5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8";

describe("sha256", () => {
  it("matches the standard test vector", async () => {
    expect(toHex(await sha256(encoder.encode("abc")))).toBe(ABC_HASH);
  });

  it("matches the hash used on testnet for the sample invoice", async () => {
    const file = new Blob([encoder.encode("factura-ascensor-0001")]);

    expect(toHex(await hashFile(file))).toBe(SAMPLE_INVOICE_HASH);
  });

  it("produces 32 bytes whatever the input size", async () => {
    expect((await sha256(new Uint8Array(0))).length).toBe(32);
    expect((await sha256(new Uint8Array(1_000_000))).length).toBe(32);
  });
});

describe("hex conversion", () => {
  it("round-trips bytes and hexadecimal", () => {
    expect(toHex(fromHex(ABC_HASH))).toBe(ABC_HASH);
  });

  it("accepts uppercase hexadecimal", () => {
    expect(toHex(fromHex(ABC_HASH.toUpperCase()))).toBe(ABC_HASH);
  });

  it("rejects text that is not 64 hexadecimal characters", () => {
    for (const text of ["", "abc", ABC_HASH.slice(1), `${ABC_HASH}0`, `${"g".repeat(64)}`]) {
      expect(() => fromHex(text), text).toThrow(HashFormatError);
    }
  });
});

describe("bytesEqual", () => {
  it("compares length and content", () => {
    expect(bytesEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2))).toBe(true);
    expect(bytesEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 3))).toBe(false);
    expect(bytesEqual(Uint8Array.of(1, 2), Uint8Array.of(1, 2, 3))).toBe(false);
  });
});

describe("matchesInvoice", () => {
  const invoice = new Blob([encoder.encode("factura-ascensor-0001")]);

  it("accepts the file the hash was computed from, as hex or as bytes", async () => {
    expect(await matchesInvoice(invoice, SAMPLE_INVOICE_HASH)).toBe(true);
    expect(await matchesInvoice(invoice, fromHex(SAMPLE_INVOICE_HASH))).toBe(true);
  });

  it("rejects a different file", async () => {
    const tampered = new Blob([encoder.encode("factura-ascensor-0002")]);

    expect(await matchesInvoice(tampered, SAMPLE_INVOICE_HASH)).toBe(false);
  });

  it("rejects a stored hash that is not valid hexadecimal", async () => {
    await expect(matchesInvoice(invoice, "not-a-hash")).rejects.toThrow(HashFormatError);
  });
});

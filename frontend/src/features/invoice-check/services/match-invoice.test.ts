import { describe, expect, it } from "vitest";

import { matchInvoice } from "./match-invoice";

const A = "5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8";
const B = "0".repeat(64);

describe("invoice match", () => {
  it("finds the expense whose fingerprint equals the file's", () => {
    expect(matchInvoice(A, [{ id: 0, invoiceHash: B }, { id: 1, invoiceHash: A }])).toEqual([1]);
  });

  it("finds nothing when no expense has that fingerprint", () => {
    expect(matchInvoice(A, [{ id: 0, invoiceHash: B }])).toEqual([]);
  });

  it("ignores letter case", () => {
    expect(matchInvoice(A.toUpperCase(), [{ id: 3, invoiceHash: A }])).toEqual([3]);
  });

  it("lists every expense proposed with the same invoice", () => {
    expect(matchInvoice(A, [{ id: 2, invoiceHash: A }, { id: 5, invoiceHash: A }])).toEqual([2, 5]);
  });
});

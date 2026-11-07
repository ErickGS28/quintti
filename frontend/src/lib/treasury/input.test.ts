import { describe, expect, it } from "vitest";

import { INVOICE_MAX_BYTES, MAX_AMOUNT } from "@/config/constants";
import { OTHER_ADDRESS } from "@/test-support/fakes";

import { validateAddress, validateAmount, validateCategory, validateInvoice } from "./input";

function failure(run: () => unknown) {
  try {
    run();
  } catch (error) {
    return error as { kind: string; field: string };
  }
  throw new Error("expected the call to throw");
}

describe("validateCategory", () => {
  it("accepts letters, digits and underscores and trims spaces", () => {
    expect(validateCategory(" maintenance ")).toBe("maintenance");
    expect(validateCategory("security_2026")).toBe("security_2026");
    expect(validateCategory("a".repeat(32))).toHaveLength(32);
  });

  it("rejects empty, long or symbol-containing names", () => {
    for (const text of ["", "   ", "a".repeat(33), "with space", "ñandú", "a-b", "a.b"]) {
      expect(failure(() => validateCategory(text)), text).toMatchObject({ kind: "invalid-input", field: "category" });
    }
  });
});

describe("validateAddress", () => {
  it("accepts account and contract addresses", () => {
    expect(validateAddress(OTHER_ADDRESS, "vendor")).toBe(OTHER_ADDRESS);
    const contractId = "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA";
    expect(validateAddress(`  ${contractId} `, "vendor")).toBe(contractId);
  });

  it("rejects anything else and names the field", () => {
    for (const text of ["", "G123", "not an address", OTHER_ADDRESS.slice(1)]) {
      expect(failure(() => validateAddress(text, "vendor")), text).toMatchObject({
        kind: "invalid-input",
        field: "vendor",
      });
    }
  });
});

describe("validateAmount", () => {
  it("accepts positive amounts up to the contract's maximum", () => {
    expect(validateAmount(1n)).toBe(1n);
    expect(validateAmount(MAX_AMOUNT)).toBe(MAX_AMOUNT);
  });

  it("rejects zero, negative and too large amounts", () => {
    for (const amount of [0n, -1n, MAX_AMOUNT + 1n]) {
      expect(failure(() => validateAmount(amount)), String(amount)).toMatchObject({
        kind: "invalid-input",
        field: "amount",
      });
    }
  });

  it("names a custom field", () => {
    expect(failure(() => validateAmount(0n, "limit"))).toMatchObject({ field: "limit" });
  });
});

describe("validateInvoice", () => {
  it("accepts a file with content", () => {
    const file = new Blob(["factura"]);

    expect(validateInvoice(file)).toBe(file);
  });

  it("rejects an empty file", () => {
    expect(failure(() => validateInvoice(new Blob([])))).toMatchObject({ kind: "invalid-input", field: "invoice" });
  });

  it("rejects a file above the size limit", () => {
    const tooBig = { size: INVOICE_MAX_BYTES + 1 } as Blob;

    expect(failure(() => validateInvoice(tooBig))).toMatchObject({ kind: "invalid-input", field: "invoice" });
  });
});

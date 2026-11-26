import { describe, expect, it } from "vitest";

import {
  DESCRIPTION_MAX_BYTES,
  INVOICE_MAX_BYTES,
  INVOICE_URI_MAX_BYTES,
  MAX_AMOUNT,
  NAME_MAX_BYTES,
} from "@/config/constants";
import { OTHER_ADDRESS } from "@/test-support/fakes";

import {
  validateAddress,
  validateAmount,
  validateCategory,
  validateDescription,
  validateInvoice,
  validateInvoiceUri,
  validateName,
} from "./input";

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

describe("validateName", () => {
  it("trims the name and accepts the whole limit", () => {
    expect(validateName("  Torres del Parque  ")).toBe("Torres del Parque");
    expect(validateName("a".repeat(NAME_MAX_BYTES))).toHaveLength(NAME_MAX_BYTES);
  });

  it("rejects an empty name and one over the limit", () => {
    for (const text of ["", "   ", "a".repeat(NAME_MAX_BYTES + 1)]) {
      expect(failure(() => validateName(text))).toMatchObject({ kind: "invalid-input", field: "name" });
    }
  });

  it("counts bytes, not letters: an accented letter takes two", () => {
    expect(() => validateName("\u00f1".repeat(NAME_MAX_BYTES / 2))).not.toThrow();
    expect(failure(() => validateName("\u00f1".repeat(NAME_MAX_BYTES / 2 + 1)))).toMatchObject({ field: "name" });
  });
});

describe("validateDescription", () => {
  it("trims the text and accepts the whole limit", () => {
    expect(validateDescription("  Mantenimiento del ascensor ")).toBe("Mantenimiento del ascensor");
    expect(validateDescription("a".repeat(DESCRIPTION_MAX_BYTES))).toHaveLength(DESCRIPTION_MAX_BYTES);
  });

  it("rejects a missing or too long description, naming the field", () => {
    for (const text of ["", "  \n ", "a".repeat(DESCRIPTION_MAX_BYTES + 1)]) {
      expect(failure(() => validateDescription(text))).toMatchObject({ kind: "invalid-input", field: "description" });
    }
  });

  it("counts bytes, so 101 accented letters are too many", () => {
    expect(() => validateDescription("\u00f1".repeat(100))).not.toThrow();
    expect(failure(() => validateDescription("\u00f1".repeat(101)))).toMatchObject({ field: "description" });
  });
});

describe("validateInvoiceUri", () => {
  it("lets the link be empty", () => {
    expect(validateInvoiceUri("")).toBe("");
    expect(validateInvoiceUri("   ")).toBe("");
  });

  it("accepts http and https addresses and trims them", () => {
    expect(validateInvoiceUri(" https://example.org/facturas/0042.pdf ")).toBe("https://example.org/facturas/0042.pdf");
    expect(validateInvoiceUri("http://example.org/a")).toBe("http://example.org/a");
  });

  it("rejects other protocols and things that are not addresses", () => {
    for (const text of ["ftp://example.org/a.pdf", "javascript:alert(1)", "data:text/html,x", "file:///c/a.pdf", "not a link", "example.org/a.pdf"]) {
      expect(failure(() => validateInvoiceUri(text))).toMatchObject({ kind: "invalid-input", field: "invoiceUri" });
    }
  });

  it("rejects a link longer than the limit", () => {
    const long = "https://example.org/" + "a".repeat(INVOICE_URI_MAX_BYTES);
    expect(failure(() => validateInvoiceUri(long))).toMatchObject({ field: "invoiceUri" });
  });
});

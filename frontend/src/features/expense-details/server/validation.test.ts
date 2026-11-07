import { describe, expect, it } from "vitest";

import { INVOICE_UPLOAD_MAX_BYTES } from "@/config/constants";

import { DetailsError } from "./details-error";
import { cleanFileName, parseDetailsForm, parseExpenseId } from "./validation";

function form(fields: Record<string, string | Blob>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const pdf = new File(["%PDF-1.7 factura"], "factura.pdf", { type: "application/pdf" });

function fieldOf(run: () => unknown): string | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof DetailsError) return error.field;
  }
  return undefined;
}

describe("expense details input", () => {
  it("reads a complete form and trims the text", () => {
    const input = parseDetailsForm(
      form({ description: "  Reparación del ascensor ", vendorLabel: " Técnico ", invoice: pdf }),
    );

    expect(input).toMatchObject({
      description: "Reparación del ascensor",
      vendorLabel: "Técnico",
      invoiceName: "factura.pdf",
      invoiceType: "application/pdf",
    });
  });

  it("treats an empty vendor name as none", () => {
    expect(parseDetailsForm(form({ description: "Aseo", invoice: pdf })).vendorLabel).toBeNull();
  });

  it("names the field at fault", () => {
    expect(fieldOf(() => parseDetailsForm(form({ description: "no", invoice: pdf })))).toBe("description");
    expect(fieldOf(() => parseDetailsForm(form({ description: "Aseo", vendorLabel: "x".repeat(121), invoice: pdf })))).toBe(
      "vendorLabel",
    );
    expect(fieldOf(() => parseDetailsForm(form({ description: "Aseo" })))).toBe("invoice");
  });

  it("accepts only PDF and image invoices within the upload limit", () => {
    const text = new File(["hola"], "nota.txt", { type: "text/plain" });
    const huge = new File([new Uint8Array(INVOICE_UPLOAD_MAX_BYTES + 1)], "grande.pdf", { type: "application/pdf" });

    expect(fieldOf(() => parseDetailsForm(form({ description: "Aseo", invoice: text })))).toBe("invoice");
    expect(fieldOf(() => parseDetailsForm(form({ description: "Aseo", invoice: huge })))).toBe("invoice");
  });

  it("reads an expense id and rejects anything else", () => {
    expect(parseExpenseId("0")).toBe(0);
    expect(parseExpenseId("42")).toBe(42);
    for (const bad of ["-1", "1.5", "abc", "", "99999999999"]) {
      expect(() => parseExpenseId(bad), bad).toThrow(DetailsError);
    }
  });

  it("keeps file names readable and free of folders", () => {
    expect(cleanFileName("C:\\Users\\marta\\factura.pdf")).toBe("factura.pdf");
    expect(cleanFileName("../../etc/passwd")).toBe("passwd");
    expect(cleanFileName("\u0007")).toBe("factura");
  });
});

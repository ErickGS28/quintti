import { INVOICE_TYPES, INVOICE_UPLOAD_MAX_BYTES, type InvoiceType } from "@/config/constants";

import { DetailsError } from "./details-error";

export interface DetailsInput {
  description: string;
  vendorLabel: string | null;
  invoice: Blob;
  invoiceName: string;
  invoiceType: InvoiceType;
}

const MAX_U32 = 4_294_967_295;

function invalid(field: string, message: string): DetailsError {
  return new DetailsError("invalid-input", message, field);
}

/** An expense id from the URL: a whole number the contract can store as `u32`. */
export function parseExpenseId(text: string): number {
  if (!/^\d{1,10}$/.test(text) || Number(text) > MAX_U32) {
    throw invalid("id", "The expense id must be a whole number");
  }
  return Number(text);
}

function isInvoiceType(value: string): value is InvoiceType {
  return Object.hasOwn(INVOICE_TYPES, value);
}

/** Keeps a file name readable and safe to show: no folders, no control characters, bounded length. */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (clean || "factura").slice(-200);
}

/**
 * Reads the form posted with an expense's details. Text is trimmed; the vendor name is optional.
 *
 * Errors: `DetailsError` with code `invalid-input` and the field at fault.
 */
export function parseDetailsForm(form: FormData): DetailsInput {
  const description = String(form.get("description") ?? "").trim();
  if (description.length < 3 || description.length > 500) {
    throw invalid("description", "The description must be 3 to 500 characters");
  }

  const vendorText = String(form.get("vendorLabel") ?? "").trim();
  if (vendorText.length > 120) {
    throw invalid("vendorLabel", "The vendor name must be at most 120 characters");
  }

  const invoice = form.get("invoice");
  if (!(invoice instanceof Blob) || invoice.size === 0) {
    throw invalid("invoice", "The invoice file is missing or empty");
  }
  if (invoice.size > INVOICE_UPLOAD_MAX_BYTES) {
    throw invalid("invoice", `The invoice file is larger than ${INVOICE_UPLOAD_MAX_BYTES} bytes`);
  }
  if (!isInvoiceType(invoice.type)) {
    throw invalid("invoice", "The invoice must be a PDF, PNG, JPEG or WebP file");
  }

  const name = invoice instanceof File ? invoice.name : "factura";
  return {
    description,
    vendorLabel: vendorText || null,
    invoice,
    invoiceName: cleanFileName(name),
    invoiceType: invoice.type,
  };
}

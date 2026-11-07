import { INVOICE_TYPES } from "@/config/constants";
import { hashFile, toHex } from "@/lib/hash/sha256";

import type { ExpenseDetails } from "../types";
import { DetailsError } from "./details-error";
import type { DetailsInput } from "./validation";

/** A stored row, with where its invoice file lives. */
export interface StoredDetails extends ExpenseDetails {
  invoicePath: string;
}

/** Where details are kept. The Supabase implementation is in `supabase-details-store.ts`. */
export interface DetailsStore {
  list(): Promise<ExpenseDetails[]>;
  find(expenseId: number): Promise<StoredDetails | null>;
  /** Stores the file, then the row. Fails with `already-attached` if the row exists. */
  save(details: StoredDetails, file: Blob): Promise<ExpenseDetails>;
  /** The invoice file's bytes. */
  openInvoice(path: string): Promise<Response>;
}

export interface DetailsServiceDependencies {
  store: DetailsStore;
  /** The `invoice_hash` the contract stores for an expense, in hexadecimal, or `null` if there is no such expense. */
  invoiceHashOnChain: (expenseId: number) => Promise<string | null>;
  /** The treasury the details belong to; part of every storage path. */
  contractId: string;
  now?: () => Date;
}

/**
 * Saves and serves the description and invoice of expenses. A file is accepted only if its SHA-256
 * equals the fingerprint the contract recorded when the expense was proposed, so nobody can attach
 * a different invoice; and details are written once, so nobody can replace them.
 */
export function createDetailsService({
  store,
  invoiceHashOnChain,
  contractId,
  now = () => new Date(),
}: DetailsServiceDependencies) {
  return {
    list: () => store.list(),

    /**
     * Errors: `DetailsError` with code `already-attached`, `not-found` (no such expense on-chain)
     * or `mismatch` (the file is not the invoice the expense was proposed with).
     */
    async attach(expenseId: number, input: DetailsInput): Promise<ExpenseDetails> {
      if (await store.find(expenseId)) {
        throw new DetailsError("already-attached", "This expense already has its details");
      }
      const recorded = await invoiceHashOnChain(expenseId);
      if (recorded === null) {
        throw new DetailsError("not-found", "No expense exists with that id");
      }
      const hash = toHex(await hashFile(input.invoice));
      if (hash !== recorded.toLowerCase()) {
        throw new DetailsError("mismatch", "The file is not the invoice this expense was proposed with", "invoice");
      }

      const extension = INVOICE_TYPES[input.invoiceType];
      return store.save(
        {
          expenseId,
          description: input.description,
          vendorLabel: input.vendorLabel,
          invoice: { name: input.invoiceName, type: input.invoiceType, size: input.invoice.size, hash },
          createdAt: now().toISOString(),
          invoicePath: `${contractId}/${expenseId}/${hash}.${extension}`,
        },
        input.invoice,
      );
    },

    /**
     * The invoice of an expense, to stream to the browser.
     *
     * Errors: `DetailsError` with code `not-found` when the expense has no saved invoice.
     */
    async invoice(expenseId: number): Promise<{ body: ReadableStream<Uint8Array> | null; details: ExpenseDetails }> {
      const stored = await store.find(expenseId);
      if (!stored) throw new DetailsError("not-found", "This expense has no saved invoice");
      const file = await store.openInvoice(stored.invoicePath);
      return { body: file.body, details: stored };
    },
  };
}

export type DetailsService = ReturnType<typeof createDetailsService>;

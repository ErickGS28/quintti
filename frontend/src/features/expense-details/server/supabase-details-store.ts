import { SupabaseError, type SupabaseRest } from "@/lib/supabase/rest";

import type { ExpenseDetails } from "../types";
import { DetailsError } from "./details-error";
import type { DetailsStore, StoredDetails } from "./details-service";

/** A row of `public.expense_details` (see `supabase/migrations`). */
interface DetailsRow {
  contract_id: string;
  expense_id: number;
  description: string;
  vendor_label: string | null;
  invoice_hash: string;
  invoice_path: string;
  invoice_name: string;
  invoice_type: string;
  invoice_size: number;
  created_at: string;
}

const TABLE = "expense_details";

function toStored(row: DetailsRow): StoredDetails {
  return {
    expenseId: row.expense_id,
    description: row.description,
    vendorLabel: row.vendor_label,
    invoice: { name: row.invoice_name, type: row.invoice_type, size: row.invoice_size, hash: row.invoice_hash },
    createdAt: row.created_at,
    invoicePath: row.invoice_path,
  };
}

/** The public shape, without the storage path. */
function toPublic(stored: StoredDetails): ExpenseDetails {
  return {
    expenseId: stored.expenseId,
    description: stored.description,
    vendorLabel: stored.vendorLabel,
    invoice: stored.invoice,
    createdAt: stored.createdAt,
  };
}

function upstream(error: unknown): DetailsError {
  const message = error instanceof Error ? error.message : "Off-chain storage failed";
  return new DetailsError("upstream", message);
}

/** Expense details in Supabase: rows in `expense_details`, files in a private bucket. */
export function createSupabaseDetailsStore(rest: SupabaseRest, contractId: string, bucket: string): DetailsStore {
  return {
    async list() {
      try {
        const rows = await rest.select<DetailsRow>(TABLE, {
          contract_id: `eq.${contractId}`,
          select: "*",
          order: "expense_id.asc",
        });
        return rows.map((row) => toPublic(toStored(row)));
      } catch (error) {
        throw upstream(error);
      }
    },

    async find(expenseId) {
      try {
        const [row] = await rest.select<DetailsRow>(TABLE, {
          contract_id: `eq.${contractId}`,
          expense_id: `eq.${expenseId}`,
          select: "*",
        });
        return row ? toStored(row) : null;
      } catch (error) {
        throw upstream(error);
      }
    },

    async save(details, file) {
      try {
        await rest.upload(bucket, details.invoicePath, file, details.invoice.type);
        const row = await rest.insert<DetailsRow>(TABLE, {
          contract_id: contractId,
          expense_id: details.expenseId,
          description: details.description,
          vendor_label: details.vendorLabel,
          invoice_hash: details.invoice.hash,
          invoice_path: details.invoicePath,
          invoice_name: details.invoice.name,
          invoice_type: details.invoice.type,
          invoice_size: details.invoice.size,
          created_at: details.createdAt,
        });
        return toPublic(toStored(row));
      } catch (error) {
        // Two saves at the same time: the row is written once, and the file is the same either way.
        if (error instanceof SupabaseError && error.isConflict) {
          throw new DetailsError("already-attached", "This expense already has its details");
        }
        throw upstream(error);
      }
    },

    async openInvoice(path) {
      try {
        return await rest.download(bucket, path);
      } catch (error) {
        if (error instanceof SupabaseError && (error.status === 404 || error.status === 400)) {
          throw new DetailsError("not-found", "The invoice file is missing from storage");
        }
        throw upstream(error);
      }
    },
  };
}

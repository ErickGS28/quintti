import type { AppConfig } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";
import { toHex } from "@/lib/hash/sha256";
import { createTreasuryClient } from "@/lib/stellar/treasury-client";
import { CALL_OPTIONS, readResult } from "@/lib/stellar/transaction-service";

import { DetailsError } from "./details-error";

/**
 * Reads, from the contract itself, the invoice fingerprint an expense was proposed with. This is
 * the source of truth the server checks uploaded files against. Only simulated: nothing is signed.
 */
export function onChainInvoiceHash(config: AppConfig) {
  const client = createTreasuryClient(config);

  return async (expenseId: number): Promise<string | null> => {
    try {
      const expense = await readResult(() => client.get_expense({ id: expenseId }, CALL_OPTIONS));
      return toHex(expense.invoice_hash);
    } catch (error) {
      if (error instanceof AppError && error.kind === "contract" && error.contractError === "ExpenseNotFound") {
        return null;
      }
      throw new DetailsError("upstream", "Could not read the expense from the network");
    }
  };
}

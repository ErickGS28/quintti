import { Buffer } from "buffer";

import { hashFile } from "@/lib/hash/sha256";
import { CALL_OPTIONS, type WriteReceipt } from "@/lib/stellar/transaction-service";
import { executeWrite, type WriteDependencies } from "@/lib/treasury/execute-write";
import {
  validateAddress,
  validateAmount,
  validateCategory,
  validateInvoice,
  validateWholeNumber,
} from "@/lib/treasury/input";

export interface ProposeExpenseInput {
  category: string;
  /** Address of the approved vendor that will be paid. */
  vendor: string;
  /** Amount in the token's base units. */
  amount: bigint;
  /** The invoice file. Only its SHA-256 fingerprint leaves the browser. */
  invoice: Blob;
}

/**
 * Proposing, approving and cancelling expenses. Each action is signed by the
 * connected wallet, so what the contract allows depends on which account that
 * is (the administrator proposes, council members approve).
 */
export function createExpenseService(deps: WriteDependencies) {
  return {
    /**
     * Proposes an expense and returns its id.
     *
     * Errors: `AppError` of kind `invalid-input` before anything is sent, then
     * the contract's own rules (`VendorNotApproved`, `OverBudget`, ...).
     */
    async propose(input: ProposeExpenseInput): Promise<WriteReceipt<number>> {
      const category = validateCategory(input.category);
      const vendor = validateAddress(input.vendor, "vendor");
      const amount = validateAmount(input.amount);
      const invoice = validateInvoice(input.invoice);
      const invoiceHash = Buffer.from(await hashFile(invoice));

      return executeWrite(deps, (client) =>
        client.propose_expense({ category, vendor, amount, invoice_hash: invoiceHash }, CALL_OPTIONS),
      );
    },

    /** Approves an expense as the connected council member. The approval that reaches the threshold pays the vendor. */
    async approve(id: number): Promise<WriteReceipt<void>> {
      const expenseId = validateWholeNumber(id, "id");
      return executeWrite(deps, (client, approver) =>
        client.approve_expense({ approver, id: expenseId }, CALL_OPTIONS),
      );
    },

    /** Cancels a pending expense as the connected administrator or assembly. */
    async cancel(id: number): Promise<WriteReceipt<void>> {
      const expenseId = validateWholeNumber(id, "id");
      return executeWrite(deps, (client, caller) =>
        client.cancel_expense({ caller, id: expenseId }, CALL_OPTIONS),
      );
    },
  };
}

export type ExpenseService = ReturnType<typeof createExpenseService>;

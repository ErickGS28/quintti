import { EXPENSES_PAGE_SIZE } from "@/config/constants";
import type { Client, Expense } from "@/contracts/generated";
import { toHex } from "@/lib/hash/sha256";
import { CALL_OPTIONS, readResult, readValue } from "@/lib/stellar/transaction-service";

import type { BudgetLineView, ExpenseView, TreasurySnapshot } from "../types";

function toExpenseView(expense: Expense): ExpenseView {
  return {
    id: expense.id,
    category: expense.category,
    vendor: expense.vendor,
    amount: expense.amount,
    invoiceHash: toHex(expense.invoice_hash),
    approvals: expense.approvals,
    status: expense.status.tag === "Paid" ? "paid" : expense.status.tag === "Cancelled" ? "cancelled" : "pending",
    createdAt: expense.created_at,
    paidAt: expense.paid_at ?? null,
  };
}

/**
 * Reads the treasury's state from the contract. It needs no wallet and no
 * account: reads are only simulated, never signed or paid for.
 *
 * The history is rebuilt from contract state, not from events, because the
 * RPC keeps events for a short time only.
 */
export function createTreasuryReader(client: Client) {
  const budgetLine = async (category: string): Promise<BudgetLineView | null> => {
    const line = await readValue(() => client.get_budget({ category }, CALL_OPTIONS));
    return line ? { category, limit: line.limit, spent: line.spent, remaining: line.limit - line.spent } : null;
  };

  return {
    /** Roles, council, balance, budget lines and approved vendors. */
    async snapshot(): Promise<TreasurySnapshot> {
      const [config, council, balance, categories, vendors, expenseCount] = await Promise.all([
        readResult(() => client.get_config(CALL_OPTIONS)),
        readValue(() => client.get_council(CALL_OPTIONS)),
        readResult(() => client.balance(CALL_OPTIONS)),
        readValue(() => client.list_categories(CALL_OPTIONS)),
        readValue(() => client.list_vendors(CALL_OPTIONS)),
        readValue(() => client.expense_count(CALL_OPTIONS)),
      ]);
      const budgets = (await Promise.all(categories.map(budgetLine))).filter(
        (line): line is BudgetLineView => line !== null,
      );

      return {
        token: config.token,
        assembly: config.assembly,
        administrator: config.administrator,
        threshold: config.threshold,
        council,
        balance,
        budgets,
        vendors,
        expenseCount,
      };
    },

    /** Every expense, oldest first, fetched page by page. */
    async expenses(): Promise<ExpenseView[]> {
      const count = await readValue(() => client.expense_count(CALL_OPTIONS));
      const expenses: ExpenseView[] = [];
      for (let from = 0; from < count; from += EXPENSES_PAGE_SIZE) {
        const page = await readValue(() =>
          client.get_expenses({ from, limit: EXPENSES_PAGE_SIZE }, CALL_OPTIONS),
        );
        if (page.length === 0) break;
        expenses.push(...page.map(toExpenseView));
      }
      return expenses;
    },

    /**
     * One expense.
     *
     * Errors: `AppError` of kind `contract` with `ExpenseNotFound`.
     */
    async expense(id: number): Promise<ExpenseView> {
      return toExpenseView(await readResult(() => client.get_expense({ id }, CALL_OPTIONS)));
    },
  };
}

export type TreasuryReader = ReturnType<typeof createTreasuryReader>;

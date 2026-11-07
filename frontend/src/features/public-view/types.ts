export type ExpenseStatusView = "pending" | "paid" | "cancelled";

/** A budget category with what is left of it. Amounts are in the token's base units. */
export interface BudgetLineView {
  category: string;
  limit: bigint;
  spent: bigint;
  remaining: bigint;
}

/** Everything about the treasury that is not the expense history. */
export interface TreasurySnapshot {
  token: string;
  assembly: string;
  administrator: string;
  /** Council approvals needed to pay an expense. */
  threshold: number;
  council: string[];
  /** Tokens held by the treasury, in base units. */
  balance: bigint;
  budgets: BudgetLineView[];
  vendors: string[];
  expenseCount: number;
}

export interface ExpenseView {
  id: number;
  category: string;
  vendor: string;
  amount: bigint;
  /** SHA-256 of the invoice file, in hexadecimal. */
  invoiceHash: string;
  /** Council members who approved, in order. Some may have left the council since. */
  approvals: string[];
  status: ExpenseStatusView;
  /** Ledger time in seconds since the Unix epoch. */
  createdAt: bigint;
  paidAt: bigint | null;
}

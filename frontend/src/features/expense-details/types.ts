/** The words and the file behind an expense, stored off-chain and checked against the contract. */
export interface ExpenseDetails {
  expenseId: number;
  description: string;
  /** How the vendor is called, as written by the administration. */
  vendorLabel: string | null;
  invoice: {
    name: string;
    type: string;
    size: number;
    /** SHA-256 in hexadecimal. Equal to the contract's `invoice_hash` for this expense. */
    hash: string;
  };
  /** When the details were saved, as an ISO 8601 date. */
  createdAt: string;
}

export interface DetailsList {
  /** False when off-chain storage is not connected: the app then shows the contract's data only. */
  configured: boolean;
  items: ExpenseDetails[];
}

export type DetailsErrorCode =
  | "not-configured"
  | "invalid-input"
  | "not-found"
  | "mismatch"
  | "already-attached"
  | "upstream";

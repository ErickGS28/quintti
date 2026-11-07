import type { DetailsErrorCode, DetailsList, ExpenseDetails } from "../types";

/** A failure answered by the details API, with its stable code. */
export class DetailsApiError extends Error {
  constructor(
    readonly code: DetailsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DetailsApiError";
  }
}

async function failure(response: Response): Promise<DetailsApiError> {
  const body = (await response.json().catch(() => ({}))) as { error?: DetailsErrorCode; message?: string };
  return new DetailsApiError(body.error ?? "upstream", body.message ?? `The details API answered ${response.status}`);
}

/** Where the browser downloads an expense's invoice. */
export function invoiceUrl(expenseId: number): string {
  return `/api/details/${expenseId}/invoice`;
}

/** Every expense's saved details, or `configured: false` when off-chain storage is not connected. */
export async function fetchExpenseDetails(fetchImpl: typeof fetch = fetch): Promise<DetailsList> {
  const response = await fetchImpl("/api/details", { cache: "no-store" });
  if (!response.ok) throw await failure(response);
  return (await response.json()) as DetailsList;
}

/**
 * Saves an expense's description and invoice. The server checks the file against the fingerprint the
 * contract recorded, so this only works with the invoice the expense was proposed with.
 *
 * Errors: `DetailsApiError`.
 */
export async function attachExpenseDetails(
  expenseId: number,
  input: { description: string; vendorLabel: string; invoice: Blob },
  fetchImpl: typeof fetch = fetch,
): Promise<ExpenseDetails> {
  const form = new FormData();
  form.set("description", input.description);
  form.set("vendorLabel", input.vendorLabel);
  form.set("invoice", input.invoice);
  const response = await fetchImpl(`/api/details/${expenseId}`, { method: "POST", body: form });
  if (!response.ok) throw await failure(response);
  return (await response.json()) as ExpenseDetails;
}

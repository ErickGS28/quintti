/** An expense the file may belong to: its id and the fingerprint the contract stores, in hexadecimal. */
export interface InvoiceCandidate {
  id: number;
  invoiceHash: string;
}

/**
 * The expenses whose stored fingerprint equals the file's. Usually one; more than one only when
 * the same invoice was proposed twice. Comparison ignores letter case.
 */
export function matchInvoice(fingerprint: string, candidates: readonly InvoiceCandidate[]): number[] {
  const wanted = fingerprint.toLowerCase();
  return candidates.filter((candidate) => candidate.invoiceHash.toLowerCase() === wanted).map((candidate) => candidate.id);
}

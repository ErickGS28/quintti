import { StrKey, scValToNative, type xdr } from "@stellar/stellar-sdk";

/** The part of a diagnostic event this module reads, so tests can build one without a network. */
export interface DiagnosticEventLike {
  event: {
    contractId: { toBytes(): Uint8Array } | null;
    body: { v0: { topics: readonly xdr.ScVal[] } };
  };
}

/**
 * The contract that raised the error behind a failed simulation, or undefined when it cannot be told.
 *
 * An error code only means something for the contract that raised it. A deposit that fails because the
 * account has too little money fails inside the token with `Error(Contract, #10)`, and the treasury then
 * repeats the same code as it passes the failure up. Read with the treasury's own table, that `#10` would be
 * `VendorNotApproved`. The first `error` event is the one nearest the cause, so its contract is the answer.
 *
 * The events are advice about a failure, so nothing here may throw: if the events are missing or odd, the
 * answer is undefined and the caller keeps what it had.
 */
export function failingContract(events: readonly DiagnosticEventLike[] | undefined): string | undefined {
  if (!events) return undefined;
  try {
    for (const { event } of events) {
      const first = event.body.v0.topics[0];
      if (first === undefined || scValToNative(first) !== "error") continue;
      return event.contractId ? StrKey.encodeContract(Buffer.from(event.contractId.toBytes())) : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
/**
 * The small set of failures the interface has to tell apart. Every error that
 * leaves `lib/` is an `AppError`, so screens never inspect SDK or wallet errors.
 */
export type AppErrorKind =
  /** The contract rejected the call. `contractError` says which rule. */
  | "contract"
  /** The person closed or refused the wallet prompt. A normal outcome, not a failure. */
  | "wallet-rejected"
  /** No wallet is connected, or it cannot sign right now. */
  | "wallet-unavailable"
  /** The wallet is on a different network than the app. */
  | "wallet-network"
  /** The network or the RPC could not be reached, or refused the transaction. */
  | "network"
  /** The transaction was sent but did not reach a final status in time. */
  | "timeout"
  /** Stored data expired and has to be restored before the call can run. */
  | "state-expired"
  | "unknown";

export class AppError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    message: string,
    options: {
      /** Name of the contract error, when `kind` is `"contract"`. */
      contractError?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.contractError = options.contractError;
  }

  readonly contractError: string | undefined;
}

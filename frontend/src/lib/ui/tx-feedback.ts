export type TxFeedbackState =
  | { status: "pending"; message: string }
  | { status: "success"; message: string; link?: { label: string; href: string } }
  | { status: "error"; message: string };

/** The parts of a mutation (TanStack Query) that say where a transaction stands. */
export interface MutationLike<T> {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: T;
  error: unknown;
}

export interface TxMessages<T> {
  pending: string;
  success: string | ((data: T) => string);
  explorerLabel: string;
  /** Turns the error into words for people. */
  describe: (error: unknown) => string;
}

/**
 * What to show for a transaction that changes the treasury, or nothing before it starts. A success
 * links to the transaction in the explorer when the receipt has one.
 */
export function txFeedbackFor<T extends { explorerUrl?: string }>(
  mutation: MutationLike<T>,
  messages: TxMessages<T>,
): TxFeedbackState | null {
  if (mutation.isPending) return { status: "pending", message: messages.pending };
  if (mutation.isError) return { status: "error", message: messages.describe(mutation.error) };
  if (mutation.isSuccess && mutation.data) {
    const message = typeof messages.success === "function" ? messages.success(mutation.data) : messages.success;
    const href = mutation.data.explorerUrl;
    return { status: "success", message, link: href ? { label: messages.explorerLabel, href } : undefined };
  }
  return null;
}

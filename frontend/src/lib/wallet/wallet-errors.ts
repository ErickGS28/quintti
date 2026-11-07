import { AppError } from "@/lib/errors/app-error";

/** Wallets report errors as `Error`s, plain objects or strings, so read the message defensively. */
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "The wallet reported an error";
}

/**
 * Wallets do not agree on how to say "the person closed the prompt", so this
 * matches the wording they use. *To verify* against each wallet we support.
 */
const REJECTION = /declin|reject|denied|cancel|closed|refus|dismiss/i;

/** Classifies a failure raised by the wallet library. */
export function toWalletError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  const message = messageOf(error);
  return new AppError(REJECTION.test(message) ? "wallet-rejected" : "wallet-unavailable", message, {
    cause: error,
  });
}

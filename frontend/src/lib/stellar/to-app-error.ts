import { contract } from "@stellar/stellar-sdk";

import { AppError } from "@/lib/errors/app-error";

import { contractErrorName, findContractErrorCode, isContractErrorName } from "./contract-errors";

const buildErrors = contract.AssembledTransaction.Errors;
const sendErrors = contract.SentTransaction.Errors;

function contractAppError(name: string | undefined, original: unknown): AppError {
  const message = name ? `The contract rejected the call: ${name}` : "The contract rejected the call";
  return new AppError("contract", message, { contractError: name, cause: original });
}

/**
 * Turns anything thrown while talking to the network or the wallet into an
 * `AppError`. The SDK reports failures with typed error classes, which are
 * checked first. Text is only inspected to find the contract's error code and
 * to recognize a connection failure.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  const code = findContractErrorCode(message);
  if (code !== undefined) {
    return contractAppError(contractErrorName(code), error);
  }

  if (error instanceof buildErrors.UserRejected) {
    return new AppError("wallet-rejected", message, { cause: error });
  }
  if (error instanceof buildErrors.NoSigner || error instanceof buildErrors.InternalWalletError) {
    return new AppError("wallet-unavailable", message, { cause: error });
  }
  if (error instanceof sendErrors.TransactionStillPending) {
    return new AppError("timeout", message, { cause: error });
  }
  if (error instanceof buildErrors.ExpiredState || error instanceof buildErrors.RestorationFailure) {
    return new AppError("state-expired", message, { cause: error });
  }
  if (
    error instanceof sendErrors.SendFailed ||
    error instanceof buildErrors.ExternalServiceError ||
    /failed to fetch|network ?error|fetch failed|ECONN|ENOTFOUND|socket hang up/i.test(message)
  ) {
    return new AppError("network", message, { cause: error });
  }

  return new AppError("unknown", message, { cause: error });
}

/**
 * Builds the `AppError` for a contract `Err` result, whose message is the
 * error's name (for example `OverBudget`).
 */
export function fromContractResultError(name: string): AppError {
  return contractAppError(isContractErrorName(name) ? name : undefined, new Error(name));
}

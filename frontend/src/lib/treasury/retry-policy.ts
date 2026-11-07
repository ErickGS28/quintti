import { AppError } from "@/lib/errors/app-error";

const MAX_NETWORK_RETRIES = 2;

/**
 * Whether a failed read is worth trying again. Only connection problems are:
 * a contract rule, bad input or a closed wallet prompt will fail the same way
 * every time.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  return error instanceof AppError && error.kind === "network" && failureCount < MAX_NETWORK_RETRIES;
}

import { rpc, type contract } from "@stellar/stellar-sdk";

import type { AppConfig } from "@/config/env";
import { TRANSACTION_TIMEOUT_SECONDS } from "@/config/constants";
import { AppError } from "@/lib/errors/app-error";

import { transactionUrl } from "./explorer";
import { fromContractResultError, toAppError } from "./to-app-error";

type Prepared<T> = Promise<contract.AssembledTransaction<contract.Result<T>>>;

/** Options passed to every contract call so transactions expire instead of hanging. */
export const CALL_OPTIONS = { timeoutInSeconds: TRANSACTION_TIMEOUT_SECONDS } as const;

export interface WriteReceipt<T> {
  /** Hash of the confirmed transaction. */
  hash: string;
  /** Link to the transaction in the block explorer. */
  explorerUrl: string;
  /** What the contract call returned. */
  value: T;
}

/**
 * Throws the simulation's own error when the network rejected the call.
 *
 * The SDK would otherwise turn it into a result that carries the contract
 * error's documentation text and drops its code, and `sendAndConfirm` would
 * go on to ask for a signature. The original message holds
 * `Error(Contract, #n)`, which `toAppError` reads.
 */
function assertSimulationSucceeded(assembled: contract.AssembledTransaction<unknown>): void {
  const { simulation } = assembled;
  if (simulation && rpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }
}

function unwrap<T>(result: contract.Result<T>): T {
  if (result.isErr()) {
    throw fromContractResultError(result.unwrapErr().message);
  }
  return result.unwrap();
}

/**
 * Runs a read-only contract call and returns its value.
 *
 * `prepare` builds the call, which simulates it. A rule that rejects the call
 * surfaces here as an `AppError`, before anything is signed.
 *
 * Errors: `AppError`.
 */
export async function readResult<T>(prepare: () => Prepared<T>): Promise<T> {
  try {
    const assembled = await prepare();
    assertSimulationSucceeded(assembled);
    return unwrap(assembled.result);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Like `readResult`, for calls that return a plain value instead of a `Result`. */
export async function readValue<T>(
  prepare: () => Promise<contract.AssembledTransaction<T>>,
): Promise<T> {
  try {
    const assembled = await prepare();
    assertSimulationSucceeded(assembled);
    return assembled.result;
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * Runs a contract call that changes state, from simulation to confirmation.
 *
 * 1. `prepare` builds and simulates the call. A rule that rejects it surfaces
 *    here, before the wallet is asked for a signature.
 * 2. The wallet signs. Closing the prompt is reported as `wallet-rejected`.
 * 3. The transaction is sent and polled until it is final or `CALL_OPTIONS`
 *    time runs out.
 *
 * Errors: `AppError`.
 */
export async function sendAndConfirm<T>(
  config: AppConfig,
  prepare: () => Prepared<T>,
): Promise<WriteReceipt<T>> {
  try {
    const assembled = await prepare();
    assertSimulationSucceeded(assembled);
    const sent = await assembled.signAndSend();

    const hash = sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash;
    if (!hash) {
      throw new AppError("unknown", "The network confirmed the transaction without a hash");
    }
    return {
      hash,
      explorerUrl: transactionUrl(config, hash),
      value: unwrap(sent.result),
    };
  } catch (error) {
    throw toAppError(error);
  }
}

import { Account, Address, BASE_FEE, Contract, TransactionBuilder, rpc, scValToNative } from "@stellar/stellar-sdk";

import type { AppConfig } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

import { toAppError } from "./to-app-error";

/** The part of the RPC server this read needs, so tests can answer without a network. */
export interface SimulatingServer {
  simulateTransaction(transaction: Parameters<rpc.Server["simulateTransaction"]>[0]): Promise<rpc.Api.SimulateTransactionResponse>;
}

/**
 * How much of a token an account holds, in the token's base units. A read: it is only simulated, so it
 * needs no signature and costs nothing. Works for any token that follows the standard `balance` function,
 * which includes the Stellar Asset Contract that wraps XLM.
 *
 * Errors: `AppError` when the token cannot be read or does not answer with a number.
 */
export async function readTokenBalance(
  config: AppConfig,
  tokenContractId: string,
  address: string,
  server: SimulatingServer = new rpc.Server(config.rpcUrl, { allowHttp: config.network === "local" }),
): Promise<bigint> {
  try {
    // The sequence number is not used by a simulation, so an empty account stands in for the real one.
    const transaction = new TransactionBuilder(new Account(address, "0"), {
      fee: BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(new Contract(tokenContractId).call("balance", new Address(address).toScVal()))
      .setTimeout(30)
      .build();

    const simulation = await server.simulateTransaction(transaction);
    if (rpc.Api.isSimulationError(simulation)) throw new Error(simulation.error);
    const value = rpc.Api.isSimulationSuccess(simulation) ? simulation.result?.retval : undefined;
    const balance = value === undefined ? undefined : scValToNative(value);
    if (typeof balance !== "bigint") throw new AppError("unknown", "The token did not answer with a balance");
    return balance;
  } catch (error) {
    throw toAppError(error);
  }
}
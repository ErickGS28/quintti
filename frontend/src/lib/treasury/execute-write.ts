import type { contract } from "@stellar/stellar-sdk";

import type { AppConfig } from "@/config/env";
import type { Client } from "@/contracts/generated";
import { createTreasuryClient } from "@/lib/stellar/treasury-client";
import type { TransactionSigner } from "@/lib/stellar/signer";
import { sendAndConfirm, type WriteReceipt } from "@/lib/stellar/transaction-service";
import { connectedSigner } from "@/lib/wallet/connected-signer";
import type { WalletAdapter } from "@/lib/wallet/wallet-adapter";

export interface WriteDependencies {
  config: AppConfig;
  wallet: WalletAdapter;
  /** Replaceable so tests need no network. */
  createClient?: (config: AppConfig, signer: TransactionSigner) => Client;
}

/**
 * Runs one contract call that changes state, signed by the connected wallet.
 *
 * Checks the wallet first, builds a client that signs with it, then simulates,
 * signs, sends and waits for confirmation. `call` receives the client and the
 * signer's address, which is who is acting (the approver, the payer, ...).
 *
 * Errors: `AppError`.
 */
export async function executeWrite<T>(
  { config, wallet, createClient = createTreasuryClient }: WriteDependencies,
  call: (
    client: Client,
    signerAddress: string,
  ) => Promise<contract.AssembledTransaction<contract.Result<T>>>,
): Promise<WriteReceipt<T>> {
  const signer = await connectedSigner(wallet, config.networkPassphrase);
  const client = createClient(config, signer);
  return sendAndConfirm(config, () => call(client, signer.address));
}

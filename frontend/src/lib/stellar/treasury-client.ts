import type { AppConfig } from "@/config/env";
import { Client } from "@/contracts/generated";

import type { TransactionSigner } from "./signer";

/**
 * A client for the configured treasury contract. Without a signer it can only
 * read. With one, writes are signed by that account.
 */
export function createTreasuryClient(config: AppConfig, signer?: TransactionSigner): Client {
  return new Client({
    contractId: config.treasuryContractId,
    networkPassphrase: config.networkPassphrase,
    rpcUrl: config.rpcUrl,
    allowHttp: config.network === "local",
    publicKey: signer?.address,
    signTransaction: signer
      ? (xdr, options) =>
          signer.signTransaction(xdr, {
            networkPassphrase: options?.networkPassphrase ?? config.networkPassphrase,
            address: options?.address ?? signer.address,
          })
      : undefined,
  });
}

import type { AppConfig } from "@/config/env";
import { Client } from "@/contracts/vault-generated";

import type { TransactionSigner } from "./signer";

/**
 * A client for the Ship It vault. Without a signer it can only read. With one, writes are signed by that
 * account. The vault is a different contract from the building's treasury, so it takes its own address.
 */
export function createVaultClient(config: AppConfig, contractId: string, signer?: TransactionSigner): Client {
  return new Client({
    contractId,
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

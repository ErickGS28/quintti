import type { AppConfig } from "@/config/env";
import type { Client } from "@/contracts/vault-generated";
import { AppError } from "@/lib/errors/app-error";
import { transactionUrl } from "@/lib/stellar/explorer";
import type { TransactionSigner } from "@/lib/stellar/signer";
import {
  CALL_OPTIONS,
  assertSimulationSucceeded,
  readValue,
  type WriteReceipt,
} from "@/lib/stellar/transaction-service";
import { createVaultClient } from "@/lib/stellar/vault-client";
import { connectedSigner } from "@/lib/wallet/connected-signer";
import type { WalletAdapter } from "@/lib/wallet/wallet-adapter";

import { toVaultError } from "./vault-errors";
import { validateCode } from "./vault-input";

export interface VaultDependencies {
  config: AppConfig;
  /** The vault's contract address. */
  contractId: string;
  wallet: WalletAdapter;
  /** Replaceable so tests need no network. */
  createClient?: (config: AppConfig, contractId: string, signer?: TransactionSigner) => Client;
}

/** What anyone can read about the vault, in the token's base units. */
export interface VaultState {
  /** What the vault holds now. */
  balance: bigint;
  /** What each account receives when it claims. */
  payout: bigint;
  /** How many accounts have claimed. */
  claims: number;
}

/**
 * The Ship It vault: read what it holds, and claim a share with the connected wallet by presenting the code.
 * Errors are read with the vault's own table, not the treasury's.
 */
export function createVaultService({ config, contractId, wallet, createClient = createVaultClient }: VaultDependencies) {
  return {
    /** What the vault holds, pays and has paid. Needs no wallet. Errors: `AppError`. */
    async read(): Promise<VaultState> {
      const client = createClient(config, contractId);
      const [balance, settings, claims] = await Promise.all([
        readValue(() => client.get_balance()),
        readValue(() => client.get_config()),
        readValue(() => client.get_claims()),
      ]);
      return { balance, payout: settings.payout, claims };
    },

    /** Whether `address` already claimed its share. Errors: `AppError`. */
    async hasClaimed(address: string): Promise<boolean> {
      const client = createClient(config, contractId);
      return readValue(() => client.has_claimed({ account: address }));
    },

    /**
     * Presents `code` for the connected account and returns the receipt with what was paid.
     *
     * A wrong code, a second claim and an empty vault are rejected while the call is only simulated, so the
     * wallet is not asked for a signature in those cases.
     *
     * Errors: `AppError` of kind `invalid-input` before anything is sent; `contract` with `WrongCode`,
     * `AlreadyClaimed` or `VaultEmpty`; and the usual wallet and network kinds.
     */
    async claim(code: string): Promise<WriteReceipt<bigint>> {
      try {
        const typed = validateCode(code);
        const signer = await connectedSigner(wallet, config.networkPassphrase);
        const client = createClient(config, contractId, signer);

        const assembled = await client.claim({ claimer: signer.address, code: typed }, CALL_OPTIONS);
        assertSimulationSucceeded(assembled);
        const sent = await assembled.signAndSend();

        const hash = sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash;
        if (!hash) throw new AppError("unknown", "The network confirmed the transaction without a hash");
        const result = sent.result;
        if (result.isErr()) {
          const name = result.unwrapErr().message;
          throw new AppError("contract", `The vault rejected the call: ${name}`, { contractError: name });
        }
        return { hash, explorerUrl: transactionUrl(config, hash), value: result.unwrap() };
      } catch (error) {
        throw toVaultError(error);
      }
    },
  };
}

export type VaultService = ReturnType<typeof createVaultService>;

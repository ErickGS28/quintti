// Stand-ins for the network and the wallet, shared by tests. Never imported by app code.

import type { contract } from "@stellar/stellar-sdk";
import { vi } from "vitest";

import type { AppConfig } from "@/config/env";
import type { WalletAdapter } from "@/lib/wallet/wallet-adapter";

export const TEST_ADDRESS = "GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK";
export const OTHER_ADDRESS = "GAU7DETV5SYD7GVALKSAJZQIQL6CEBUFRRQJO7ZTTYI7UGP4LWJRUYZ2";

export const testConfig: AppConfig = {
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  treasuryContractId: "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA",
  token: { symbol: "XLM", decimals: 7 },
  explorerBaseUrl: "https://stellar.expert/explorer/testnet",
};

export function okResult<T>(value: T): contract.Result<T> {
  return {
    isOk: () => true,
    isErr: () => false,
    unwrap: () => value,
    unwrapErr: () => {
      throw new Error("not an error");
    },
  };
}

export function errResult(message: string): contract.Result<never> {
  return {
    isOk: () => false,
    isErr: () => true,
    unwrap: () => {
      throw new Error("is an error");
    },
    unwrapErr: () => ({ message }),
  };
}

/** A transaction whose simulation passed and that confirms with `value` and `hash`. */
export function confirmedTransaction<T>(value: T, hash = "txhash"): contract.AssembledTransaction<contract.Result<T>> {
  const sent = { sendTransactionResponse: { hash }, result: okResult(value) };
  return {
    signAndSend: vi.fn().mockResolvedValue(sent),
    simulation: undefined,
    result: okResult(value),
  } as unknown as contract.AssembledTransaction<contract.Result<T>>;
}

/** A read whose simulation passed and returns `value`. */
export function readOf<T>(value: T): contract.AssembledTransaction<contract.Result<T>> {
  return { simulation: undefined, result: okResult(value) } as unknown as contract.AssembledTransaction<
    contract.Result<T>
  >;
}

/** A plain (non-`Result`) read. */
export function plainReadOf<T>(value: T): contract.AssembledTransaction<T> {
  return { simulation: undefined, result: value } as unknown as contract.AssembledTransaction<T>;
}

export interface FakeWalletOptions {
  address?: string | null;
  networkPassphrase?: string | null;
}

export function fakeWallet({
  address = TEST_ADDRESS,
  networkPassphrase = testConfig.networkPassphrase,
}: FakeWalletOptions = {}): WalletAdapter {
  return {
    connect: vi.fn().mockResolvedValue(TEST_ADDRESS),
    getAddress: vi.fn().mockResolvedValue(address),
    getNetworkPassphrase: vi.fn().mockResolvedValue(networkPassphrase),
    signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "SIGNED" }),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
}

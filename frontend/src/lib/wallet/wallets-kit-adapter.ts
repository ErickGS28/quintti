import type { Networks } from "@creit.tech/stellar-wallets-kit/types";

import type { WalletAdapter } from "./wallet-adapter";
import { toWalletError } from "./wallet-errors";
import { QUINTTI_WALLET_THEME } from "./wallet-theme";

/** The part of Stellar Wallets Kit this adapter uses. The real kit satisfies it. */
export interface WalletsKit {
  authModal(): Promise<{ address: string }>;
  getAddress(): Promise<{ address: string }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string }>;
  signTransaction(
    xdr: string,
    options?: { networkPassphrase?: string; address?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
  disconnect(): Promise<void>;
}

/** Prepares a kit for the given network. Replaceable, so tests need no browser. */
export type KitLoader = (networkPassphrase: string) => Promise<WalletsKit>;

/**
 * Loads Stellar Wallets Kit on demand, in Quintti's colors. The kit touches
 * the browser's `window`, so it is imported only when a wallet action runs,
 * which only happens on the client.
 */
export const loadWalletsKit: KitLoader = async (networkPassphrase) => {
  const [{ StellarWalletsKit }, { defaultModules }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit/sdk"),
    import("@creit.tech/stellar-wallets-kit/modules/utils"),
  ]);
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: networkPassphrase as Networks,
    theme: QUINTTI_WALLET_THEME,
  });
  return StellarWalletsKit;
};

/**
 * A `WalletAdapter` backed by Stellar Wallets Kit, which connects to Freighter
 * (listed by the kit as Varial), xBull, Albedo, Lobstr and others.
 */
export function createWalletsKitAdapter(
  networkPassphrase: string,
  loadKit: KitLoader = loadWalletsKit,
): WalletAdapter {
  let loading: Promise<WalletsKit> | undefined;
  const kit = () => (loading ??= loadKit(networkPassphrase));

  return {
    async connect() {
      try {
        return (await (await kit()).authModal()).address;
      } catch (error) {
        throw toWalletError(error);
      }
    },

    async getAddress() {
      try {
        return (await (await kit()).getAddress()).address || null;
      } catch {
        // The kit throws when nobody has connected yet.
        return null;
      }
    },

    async getNetworkPassphrase() {
      try {
        return (await (await kit()).getNetwork()).networkPassphrase || null;
      } catch {
        // Some wallets cannot report their network.
        return null;
      }
    },

    async signTransaction(xdr, options) {
      try {
        return await (await kit()).signTransaction(xdr, options);
      } catch (error) {
        throw toWalletError(error);
      }
    },

    async disconnect() {
      try {
        await (await kit()).disconnect();
      } catch (error) {
        throw toWalletError(error);
      }
    },
  };
}

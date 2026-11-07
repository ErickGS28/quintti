import type { AppError } from "@/lib/errors/app-error";
import { toAppError } from "@/lib/stellar/to-app-error";
import { assertWalletNetwork } from "@/lib/wallet/network-check";
import type { WalletAdapter } from "@/lib/wallet/wallet-adapter";

export type WalletSessionState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; address: string }
  /** Connecting failed. A closed prompt also lands here, with kind `wallet-rejected`. */
  | { status: "failed"; error: AppError };

/**
 * Who is connected, kept outside React so it can be tested and shared. The
 * state object only changes when the status changes, which is what
 * `useSyncExternalStore` needs.
 */
export function createWalletSessionStore(wallet: WalletAdapter, networkPassphrase: string) {
  let state: WalletSessionState = { status: "disconnected" };
  const listeners = new Set<() => void>();

  const update = (next: WalletSessionState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getState: (): WalletSessionState => state,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /** Picks up a wallet that was already connected before the page loaded. Never fails. */
    async restore(): Promise<void> {
      if (state.status !== "disconnected") return;
      const address = await wallet.getAddress();
      if (address) update({ status: "connected", address });
    },

    /** Opens the wallet picker. The result is in the state, so this never throws. */
    async connect(): Promise<void> {
      update({ status: "connecting" });
      try {
        const address = await wallet.connect();
        await assertWalletNetwork(wallet, networkPassphrase);
        update({ status: "connected", address });
      } catch (error) {
        update({ status: "failed", error: toAppError(error) });
      }
    },

    async disconnect(): Promise<void> {
      try {
        await wallet.disconnect();
      } finally {
        update({ status: "disconnected" });
      }
    },
  };
}

export type WalletSessionStore = ReturnType<typeof createWalletSessionStore>;

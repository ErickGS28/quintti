import { getConfig } from "@/config/env";

import type { WalletAdapter } from "./wallet-adapter";
import { createWalletsKitAdapter } from "./wallets-kit-adapter";

let instance: WalletAdapter | undefined;

/**
 * The app's single wallet adapter, created on first use for the configured
 * network. Only call it from the browser (inside an event handler or effect).
 */
export function getWalletAdapter(): WalletAdapter {
  instance ??= createWalletsKitAdapter(getConfig().networkPassphrase);
  return instance;
}

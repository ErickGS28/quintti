import { AppError } from "@/lib/errors/app-error";

import type { WalletAdapter } from "./wallet-adapter";

/**
 * Makes sure the wallet is on the network the app uses before anything is
 * signed. A wallet that does not report its network is let through, because
 * the signature itself is bound to the network passphrase.
 *
 * Errors: `AppError` of kind `wallet-network`.
 */
export async function assertWalletNetwork(
  wallet: WalletAdapter,
  expectedPassphrase: string,
): Promise<void> {
  const actual = await wallet.getNetworkPassphrase();
  if (actual !== null && actual !== expectedPassphrase) {
    throw new AppError(
      "wallet-network",
      `The wallet is on "${actual}" but the app uses "${expectedPassphrase}"`,
    );
  }
}

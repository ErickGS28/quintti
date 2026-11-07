import { AppError } from "@/lib/errors/app-error";
import type { TransactionSigner } from "@/lib/stellar/signer";

import { assertWalletNetwork } from "./network-check";
import type { WalletAdapter } from "./wallet-adapter";

/**
 * The account that will sign, checked and ready: a wallet is connected and it
 * is on the app's network.
 *
 * Errors: `AppError` of kind `wallet-unavailable` or `wallet-network`.
 */
export async function connectedSigner(
  wallet: WalletAdapter,
  networkPassphrase: string,
): Promise<TransactionSigner> {
  const address = await wallet.getAddress();
  if (!address) {
    throw new AppError("wallet-unavailable", "No wallet is connected");
  }
  await assertWalletNetwork(wallet, networkPassphrase);
  return {
    address,
    signTransaction: (xdr, options) => wallet.signTransaction(xdr, options),
  };
}

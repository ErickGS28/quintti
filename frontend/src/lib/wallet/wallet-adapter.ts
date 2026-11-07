import type { TransactionSigner } from "@/lib/stellar/signer";

/**
 * Everything the app needs from a wallet. Screens and features depend on this
 * interface only, so the wallet library can change without touching them.
 *
 * Every method reports failures as an `AppError`.
 */
export interface WalletAdapter {
  /** Opens the wallet picker and returns the address the person chose. */
  connect(): Promise<string>;
  /** The connected address, or `null` when no wallet is connected. */
  getAddress(): Promise<string | null>;
  /** The network passphrase the wallet is on, or `null` when it does not say. */
  getNetworkPassphrase(): Promise<string | null>;
  signTransaction: TransactionSigner["signTransaction"];
  disconnect(): Promise<void>;
}

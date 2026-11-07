/**
 * What the transaction layer needs from a wallet: an address and a way to sign.
 * `lib/wallet` provides implementations. Keeping the shape here means this
 * layer never depends on a particular wallet library.
 */
export interface TransactionSigner {
  /** The account that signs and pays the fee. */
  address: string;
  signTransaction(
    xdr: string,
    options: { networkPassphrase: string; address: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
}

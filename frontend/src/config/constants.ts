/** Networks the app can talk to. Mainnet is deliberately absent. */
export const NETWORKS = {
  testnet: {
    passphrase: "Test SDF Network ; September 2015",
    defaultRpcUrl: "https://soroban-testnet.stellar.org",
    explorerBaseUrl: "https://stellar.expert/explorer/testnet",
  },
  local: {
    passphrase: "Standalone Network ; February 2017",
    defaultRpcUrl: "http://localhost:8000/soroban/rpc",
    explorerBaseUrl: "https://stellar.expert/explorer/testnet",
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

/** Decimals of Stellar Asset Contract tokens. */
export const DEFAULT_TOKEN_DECIMALS = 7;

/** Matches the contract's `MAX_PAGE`, the largest page `get_expenses` returns. */
export const EXPENSES_PAGE_SIZE = 20;

/** Seconds a built transaction stays valid before it expires. */
export const TRANSACTION_TIMEOUT_SECONDS = 60;

/** Longest wait for a submitted transaction to reach a final status. */
export const TRANSACTION_CONFIRMATION_TIMEOUT_MS = 60_000;

/** How long read queries stay fresh before they are fetched again. */
export const QUERY_STALE_TIME_MS = 5_000;

/** Largest invoice file accepted. The file is hashed in the browser, so this bounds memory. */
export const INVOICE_MAX_BYTES = 20 * 1024 * 1024;

/** Largest value the contract accepts for an amount (`i128`). */
export const MAX_AMOUNT = 2n ** 127n - 1n;

/**
 * Largest invoice the app uploads for residents to download. Hosting platforms cap request bodies
 * at about 4.5 MB, so larger files are still fingerprinted on-chain but not uploaded.
 */
export const INVOICE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

/** Invoice formats the app stores, with the extension used in storage paths. */
export const INVOICE_TYPES = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

export type InvoiceType = keyof typeof INVOICE_TYPES;

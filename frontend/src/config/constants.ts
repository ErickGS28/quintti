/**
 * Networks the app can talk to. Mainnet is opt-in (decision 0018): it has no default RPC URL, so
 * choosing a provider is a deliberate step, and the app labels it as an unaudited beta.
 */
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
  mainnet: {
    passphrase: "Public Global Stellar Network ; September 2015",
    // The SDF runs no public Soroban RPC for mainnet, so there is no default to fall back on.
    defaultRpcUrl: "",
    explorerBaseUrl: "https://stellar.expert/explorer/public",
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

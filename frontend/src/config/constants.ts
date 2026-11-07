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

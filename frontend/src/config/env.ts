import { StrKey } from "@stellar/stellar-sdk";

import { DEFAULT_TOKEN_DECIMALS, NETWORKS, type NetworkName } from "./constants";

export interface AppConfig {
  network: NetworkName;
  networkPassphrase: string;
  rpcUrl: string;
  treasuryContractId: string;
  token: { symbol: string; decimals: number };
  explorerBaseUrl: string;
}

/** Raw values as read from the environment. Every field may be missing. */
export interface RawConfig {
  network?: string;
  rpcUrl?: string;
  treasuryContractId?: string;
  tokenSymbol?: string;
  tokenDecimals?: string;
}

/** Thrown when the environment is incomplete or invalid. Lists every problem at once. */
export class ConfigError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid configuration: ${issues.join("; ")}`);
    this.name = "ConfigError";
  }
}

function isNetworkName(value: string): value is NetworkName {
  return Object.hasOwn(NETWORKS, value);
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates raw values and applies defaults. Pure, so it is easy to test. */
export function parseConfig(raw: RawConfig): AppConfig {
  const issues: string[] = [];

  const networkValue = raw.network?.trim() || "testnet";
  const network = isNetworkName(networkValue) ? networkValue : undefined;
  if (!network) {
    issues.push(
      `NEXT_PUBLIC_STELLAR_NETWORK must be "testnet" or "local" (got "${networkValue}"); mainnet is not supported`,
    );
  }

  const rpcUrl = raw.rpcUrl?.trim() || (network ? NETWORKS[network].defaultRpcUrl : "");
  if (rpcUrl && !isHttpUrl(rpcUrl)) {
    issues.push("NEXT_PUBLIC_SOROBAN_RPC_URL must be an http(s) URL");
  }

  const treasuryContractId = raw.treasuryContractId?.trim() ?? "";
  if (!treasuryContractId) {
    issues.push("NEXT_PUBLIC_TREASURY_CONTRACT_ID is required");
  } else if (!StrKey.isValidContract(treasuryContractId)) {
    issues.push("NEXT_PUBLIC_TREASURY_CONTRACT_ID is not a valid contract address");
  }

  const symbol = raw.tokenSymbol?.trim() ?? "";
  if (!symbol) {
    issues.push("NEXT_PUBLIC_TOKEN_SYMBOL is required");
  }

  const decimalsText = raw.tokenDecimals?.trim() || String(DEFAULT_TOKEN_DECIMALS);
  const decimals = Number(decimalsText);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    issues.push("NEXT_PUBLIC_TOKEN_DECIMALS must be an integer from 0 to 18");
  }

  if (issues.length > 0 || !network) {
    throw new ConfigError(issues);
  }

  return {
    network,
    networkPassphrase: NETWORKS[network].passphrase,
    rpcUrl,
    treasuryContractId,
    token: { symbol, decimals },
    explorerBaseUrl: NETWORKS[network].explorerBaseUrl,
  };
}

let cached: AppConfig | undefined;

/**
 * The app's configuration, read once from the environment.
 *
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` when the name is written out
 * in full, so each variable is referenced explicitly here.
 */
export function getConfig(): AppConfig {
  cached ??= parseConfig({
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    treasuryContractId: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID,
    tokenSymbol: process.env.NEXT_PUBLIC_TOKEN_SYMBOL,
    tokenDecimals: process.env.NEXT_PUBLIC_TOKEN_DECIMALS,
  });
  return cached;
}

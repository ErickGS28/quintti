import type { AppConfig } from "@/config/env";

/** Link to a transaction in the block explorer. */
export function transactionUrl(config: AppConfig, hash: string): string {
  return `${config.explorerBaseUrl}/tx/${hash}`;
}

/** Link to a contract in the block explorer. */
export function contractUrl(config: AppConfig, contractId: string): string {
  return `${config.explorerBaseUrl}/contract/${contractId}`;
}

/** Link to an account in the block explorer. */
export function accountUrl(config: AppConfig, address: string): string {
  return `${config.explorerBaseUrl}/account/${address}`;
}

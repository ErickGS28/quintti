import { getConfig } from "@/config/env";

import { formatAmount } from "./amount";

/** An amount in base units of the treasury's token, shown with its code, for example "80 XLM". */
export function formatTokenAmount(baseUnits: bigint): string {
  return formatAmount(baseUnits, getConfig().token);
}

/** The code of the treasury's token, for example "XLM". */
export function tokenSymbol(): string {
  return getConfig().token.symbol;
}

/** Decimals of the treasury's token, to read amounts people type. */
export function tokenDecimals(): number {
  return getConfig().token.decimals;
}

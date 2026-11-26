"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME_MS } from "@/config/constants";
import { getConfig } from "@/config/env";
import type { AppError } from "@/lib/errors/app-error";
import { readTokenBalance } from "@/lib/stellar/token-balance";
import { treasuryKeys } from "@/lib/treasury/query-keys";

/**
 * What `address` holds of the building's token, in base units. Nothing is asked until both are known: a
 * person who has not connected a wallet has no balance to show.
 */
export function useTokenBalance(tokenContractId: string | undefined, address: string | null) {
  return useQuery<bigint, AppError>({
    queryKey: treasuryKeys.tokenBalance(tokenContractId ?? "none", address ?? "none"),
    queryFn: () => readTokenBalance(getConfig(), tokenContractId as string, address as string),
    enabled: Boolean(tokenContractId && address),
    staleTime: QUERY_STALE_TIME_MS,
    retry: false,
  });
}
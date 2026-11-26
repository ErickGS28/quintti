"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME_MS } from "@/config/constants";
import { getConfig } from "@/config/env";
import { useBuilding } from "@/lib/buildings/building-context";
import type { AppError } from "@/lib/errors/app-error";
import { createTreasuryClient } from "@/lib/stellar/treasury-client";
import { treasuryKeys } from "@/lib/treasury/query-keys";

import { createTreasuryReader, type TreasuryReader } from "../services/treasury-reader";
import type { ExpenseView, TreasurySnapshot } from "../types";

const readers = new Map<string, TreasuryReader>();

/** One reader per contract, created on first use. Reading needs no wallet. */
function treasuryReader(contractId: string): TreasuryReader {
  let reader = readers.get(contractId);
  if (!reader) {
    reader = createTreasuryReader(createTreasuryClient({ ...getConfig(), treasuryContractId: contractId }));
    readers.set(contractId, reader);
  }
  return reader;
}

/** Balance, budget lines, council and vendors of the building on screen. Needs no wallet. */
export function useTreasurySnapshot() {
  const { contractId } = useBuilding();
  return useQuery<TreasurySnapshot, AppError>({
    queryKey: treasuryKeys.snapshot(contractId),
    queryFn: () => treasuryReader(contractId).snapshot(),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

/** Every expense of the building on screen, oldest first. Needs no wallet. */
export function useExpenses() {
  const { contractId } = useBuilding();
  return useQuery<ExpenseView[], AppError>({
    queryKey: treasuryKeys.expenses(contractId),
    queryFn: () => treasuryReader(contractId).expenses(),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

/**
 * The name of any building by its address, for lists and for checking an address before saving it. It
 * fails when the address is not a compatible Quintti treasury on this network, and is not retried: that
 * answer will not change in a few seconds.
 */
export function useBuildingName(contractId: string | null) {
  return useQuery<string, AppError>({
    queryKey: treasuryKeys.name(contractId ?? "none"),
    queryFn: () => treasuryReader(contractId as string).name(),
    enabled: contractId !== null,
    staleTime: QUERY_STALE_TIME_MS * 12,
    retry: false,
  });
}
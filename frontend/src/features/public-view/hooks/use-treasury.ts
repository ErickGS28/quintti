"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME_MS } from "@/config/constants";
import { getConfig } from "@/config/env";
import type { AppError } from "@/lib/errors/app-error";
import { createTreasuryClient } from "@/lib/stellar/treasury-client";
import { treasuryKeys } from "@/lib/treasury/query-keys";

import { createTreasuryReader, type TreasuryReader } from "../services/treasury-reader";
import type { ExpenseView, TreasurySnapshot } from "../types";

let reader: TreasuryReader | undefined;

function treasuryReader(): TreasuryReader {
  reader ??= createTreasuryReader(createTreasuryClient(getConfig()));
  return reader;
}

/** Balance, budget lines, council and vendors. Needs no wallet. */
export function useTreasurySnapshot() {
  return useQuery<TreasurySnapshot, AppError>({
    queryKey: treasuryKeys.snapshot(),
    queryFn: () => treasuryReader().snapshot(),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

/** Every expense, oldest first. Needs no wallet. */
export function useExpenses() {
  return useQuery<ExpenseView[], AppError>({
    queryKey: treasuryKeys.expenses(),
    queryFn: () => treasuryReader().expenses(),
    staleTime: QUERY_STALE_TIME_MS,
  });
}

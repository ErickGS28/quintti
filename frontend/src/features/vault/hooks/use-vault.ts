"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QUERY_STALE_TIME_MS } from "@/config/constants";
import { getConfig } from "@/config/env";
import type { AppError } from "@/lib/errors/app-error";
import type { WriteReceipt } from "@/lib/stellar/transaction-service";
import { getWalletAdapter } from "@/lib/wallet/wallet-instance";

import { createVaultService, type VaultState } from "../services/vault-service";

/** Cache keys for the vault. Apart from the treasury's, which the vault does not touch. */
const vaultKeys = {
  all: ["vault"] as const,
  state: (contractId: string) => [...vaultKeys.all, contractId, "state"] as const,
  claimed: (contractId: string, address: string) => [...vaultKeys.all, contractId, "claimed", address] as const,
};

/** How often what the vault holds is read again while the page is open, so a claim by someone else shows up. */
const REFRESH_MS = 15_000;

function useVaultService(contractId: string) {
  return useMemo(
    () => createVaultService({ config: getConfig(), contractId, wallet: getWalletAdapter() }),
    [contractId],
  );
}

/** What the vault holds, pays and has paid. */
export function useVaultState(contractId: string) {
  const service = useVaultService(contractId);
  return useQuery<VaultState, AppError>({
    queryKey: vaultKeys.state(contractId),
    queryFn: () => service.read(),
    staleTime: QUERY_STALE_TIME_MS,
    refetchInterval: REFRESH_MS,
  });
}

/** Whether the connected account already claimed. Nothing is asked until a wallet is connected. */
export function useHasClaimed(contractId: string, address: string | null) {
  const service = useVaultService(contractId);
  return useQuery<boolean, AppError>({
    queryKey: vaultKeys.claimed(contractId, address ?? "none"),
    queryFn: () => service.hasClaimed(address as string),
    enabled: address !== null,
    staleTime: QUERY_STALE_TIME_MS,
  });
}

/** Presents the code with the connected wallet and refreshes the vault when it works. */
export function useClaimAction(contractId: string) {
  const service = useVaultService(contractId);
  const queryClient = useQueryClient();
  return useMutation<WriteReceipt<bigint>, AppError, { code: string }>({
    mutationFn: ({ code }) => service.claim(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vaultKeys.all }),
  });
}

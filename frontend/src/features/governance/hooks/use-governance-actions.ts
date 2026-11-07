"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { getConfig } from "@/config/env";
import type { AppError } from "@/lib/errors/app-error";
import type { WriteReceipt } from "@/lib/stellar/transaction-service";
import { treasuryKeys } from "@/lib/treasury/query-keys";
import { getWalletAdapter } from "@/lib/wallet/wallet-instance";

import { createGovernanceService } from "../services/governance-service";

/**
 * The assembly's actions with the connected wallet. Each one refreshes the
 * treasury's data when it succeeds.
 */
export function useGovernanceActions() {
  const queryClient = useQueryClient();
  const service = useMemo(
    () => createGovernanceService({ config: getConfig(), wallet: getWalletAdapter() }),
    [],
  );
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: treasuryKeys.all });

  return {
    setBudget: useMutation<WriteReceipt<void>, AppError, { category: string; limit: bigint }>({
      mutationFn: (input) => service.setBudget(input),
      onSuccess,
    }),
    setVendor: useMutation<WriteReceipt<void>, AppError, { vendor: string; allowed: boolean }>({
      mutationFn: (input) => service.setVendor(input),
      onSuccess,
    }),
    setAdministrator: useMutation<WriteReceipt<void>, AppError, string>({
      mutationFn: (administrator) => service.setAdministrator(administrator),
      onSuccess,
    }),
    rotateCouncil: useMutation<WriteReceipt<void>, AppError, { council: string[]; threshold: number }>({
      mutationFn: (input) => service.rotateCouncil(input),
      onSuccess,
    }),
  };
}

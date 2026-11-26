"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { getConfig } from "@/config/env";
import { assertTrusted } from "@/lib/buildings/assert-trusted";
import { useBuilding } from "@/lib/buildings/building-context";
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
  const building = useBuilding();
  const service = useMemo(
    () =>
      createGovernanceService({
        config: { ...getConfig(), treasuryContractId: building.contractId },
        wallet: getWalletAdapter(),
      }),
    [building.contractId],
  );
  const guarded = <T,>(run: () => Promise<T>) => {
    assertTrusted(building);
    return run();
  };
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: treasuryKeys.all });

  return {
    setBudget: useMutation<WriteReceipt<void>, AppError, { category: string; limit: bigint }>({
      mutationFn: async (input) => guarded(() => service.setBudget(input)),
      onSuccess,
    }),
    setVendor: useMutation<WriteReceipt<void>, AppError, { vendor: string; allowed: boolean }>({
      mutationFn: async (input) => guarded(() => service.setVendor(input)),
      onSuccess,
    }),
    setAdministrator: useMutation<WriteReceipt<void>, AppError, string>({
      mutationFn: async (administrator) => guarded(() => service.setAdministrator(administrator)),
      onSuccess,
    }),
    rotateCouncil: useMutation<WriteReceipt<void>, AppError, { council: string[]; threshold: number }>({
      mutationFn: async (input) => guarded(() => service.rotateCouncil(input)),
      onSuccess,
    }),
  };
}

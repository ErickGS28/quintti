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

import { createDepositService } from "../services/deposit-service";

/**
 * Deposits into the building on screen with the connected wallet, and refreshes the balances when it works.
 * It refuses on a building opened from a link and not saved, like every other write.
 */
export function useDepositAction() {
  const queryClient = useQueryClient();
  const building = useBuilding();
  const service = useMemo(
    () =>
      createDepositService({
        config: { ...getConfig(), treasuryContractId: building.contractId },
        wallet: getWalletAdapter(),
      }),
    [building.contractId],
  );

  return useMutation<WriteReceipt<void>, AppError, { amount: bigint }>({
    mutationFn: async (input) => {
      assertTrusted(building);
      return service.deposit(input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: treasuryKeys.all }),
  });
}
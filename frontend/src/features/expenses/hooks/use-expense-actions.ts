"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { getConfig } from "@/config/env";
import type { AppError } from "@/lib/errors/app-error";
import type { WriteReceipt } from "@/lib/stellar/transaction-service";
import { treasuryKeys } from "@/lib/treasury/query-keys";
import { getWalletAdapter } from "@/lib/wallet/wallet-instance";

import { createExpenseService, type ProposeExpenseInput } from "../services/expense-service";

/**
 * Propose, approve and cancel expenses with the connected wallet. Each one
 * refreshes the treasury's data when it succeeds. Failures arrive as an
 * `AppError`, and a closed wallet prompt is `kind: "wallet-rejected"`.
 */
export function useExpenseActions() {
  const queryClient = useQueryClient();
  const service = useMemo(() => createExpenseService({ config: getConfig(), wallet: getWalletAdapter() }), []);
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: treasuryKeys.all });

  return {
    propose: useMutation<WriteReceipt<number>, AppError, ProposeExpenseInput>({
      mutationFn: (input) => service.propose(input),
      onSuccess,
    }),
    approve: useMutation<WriteReceipt<void>, AppError, number>({
      mutationFn: (id) => service.approve(id),
      onSuccess,
    }),
    cancel: useMutation<WriteReceipt<void>, AppError, number>({
      mutationFn: (id) => service.cancel(id),
      onSuccess,
    }),
  };
}

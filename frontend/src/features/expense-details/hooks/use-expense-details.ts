"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { INVOICE_UPLOAD_MAX_BYTES } from "@/config/constants";

import { attachExpenseDetails, fetchExpenseDetails } from "../services/details-api";
import type { ExpenseDetails } from "../types";

const detailsKey = ["offchain", "expense-details"] as const;

/**
 * The saved description and invoice of every expense, by id. When off-chain storage is not
 * connected, `configured` is false and the map is empty: screens fall back to the contract's data.
 */
export function useExpenseDetails() {
  const query = useQuery({
    queryKey: detailsKey,
    queryFn: () => fetchExpenseDetails(),
    staleTime: 30_000,
    retry: 1,
  });

  const byId = useMemo(
    () => new Map<number, ExpenseDetails>((query.data?.items ?? []).map((item) => [item.expenseId, item])),
    [query.data],
  );

  return { configured: query.data?.configured ?? false, isLoading: query.isLoading, byId };
}

/** Saves an expense's description and invoice, then refreshes the details. */
export function useAttachExpenseDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      ...input
    }: {
      expenseId: number;
      description: string;
      vendorLabel: string;
      invoice: Blob;
    }) => attachExpenseDetails(expenseId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailsKey }),
  });
}

/** Whether a file is small enough to be uploaded for residents to download. */
export function canUploadInvoice(file: Blob): boolean {
  return file.size <= INVOICE_UPLOAD_MAX_BYTES;
}

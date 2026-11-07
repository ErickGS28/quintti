"use client";

import { PenLine } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { toasts } from "@/lib/ui/toast-store";
import { txFeedbackFor } from "@/lib/ui/tx-feedback";

import { useExpenseActions } from "../hooks/use-expense-actions";

/**
 * Approves a pending expense as the connected council member. The approval that reaches the
 * threshold also pays the vendor, in the same transaction.
 */
export function ApproveExpenseButton({ expenseId }: { expenseId: number }) {
  const { approve } = useExpenseActions();
  const { detail, tx } = appCopy;
  const feedback = txFeedbackFor(approve, {
    pending: tx.pending,
    success: detail.approved,
    explorerLabel: tx.explorer,
    describe: describeAnyError,
  });

  return (
    <div className="grid gap-3">
      <Button
        fullWidth
        size="lg"
        disabled={approve.isPending || approve.isSuccess}
        onClick={() =>
          approve.mutate(expenseId, {
            onSuccess: (receipt) =>
              toasts.show({
                tone: "success",
                title: detail.approved,
                action: { label: tx.explorer, href: receipt.explorerUrl },
              }),
          })
        }
      >
        <PenLine className="size-4" aria-hidden="true" />
        {detail.approve}
      </Button>
      {feedback ? <TxFeedback state={feedback} /> : <p className="text-sm text-ink-faint">{detail.approveHint}</p>}
    </div>
  );
}

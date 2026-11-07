"use client";

import { Ban } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { toasts } from "@/lib/ui/toast-store";
import { txFeedbackFor } from "@/lib/ui/tx-feedback";

import { useExpenseActions } from "../hooks/use-expense-actions";

/**
 * Cancels a pending expense as the connected administrator or assembly. It asks once more before
 * signing, because a cancelled expense cannot be reopened.
 */
export function CancelExpenseButton({ expenseId }: { expenseId: number }) {
  const { cancel } = useExpenseActions();
  const [confirming, setConfirming] = useState(false);
  const { detail, tx } = appCopy;
  const feedback = txFeedbackFor(cancel, {
    pending: tx.pending,
    success: detail.cancelled,
    explorerLabel: tx.explorer,
    describe: describeAnyError,
  });

  if (feedback) return <TxFeedback state={feedback} />;

  if (!confirming) {
    return (
      <Button variant="ghost" fullWidth onClick={() => setConfirming(true)}>
        <Ban className="size-4" aria-hidden="true" />
        {detail.cancel}
      </Button>
    );
  }

  return (
    <div className="grid gap-2 rounded-control bg-coral-soft p-3">
      <p className="text-sm font-medium text-wine">{detail.cancelHint}</p>
      <div className="flex gap-2">
        <Button
          variant="accent"
          className="flex-1"
          onClick={() =>
            cancel.mutate(expenseId, {
              onSuccess: (receipt) =>
                toasts.show({
                  tone: "success",
                  title: detail.cancelled,
                  action: { label: tx.explorer, href: receipt.explorerUrl },
                }),
            })
          }
        >
          {detail.cancelConfirm}
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          {detail.keep}
        </Button>
      </div>
    </div>
  );
}

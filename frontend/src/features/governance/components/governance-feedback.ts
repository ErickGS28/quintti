import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import type { WriteReceipt } from "@/lib/stellar/transaction-service";
import { toasts } from "@/lib/ui/toast-store";
import { txFeedbackFor, type MutationLike } from "@/lib/ui/tx-feedback";

/** The inline status of an assembly action, and the toast to raise when it is confirmed. */
export function governanceFeedback(mutation: MutationLike<WriteReceipt<void>>, success: string) {
  return txFeedbackFor(mutation, {
    pending: appCopy.tx.pending,
    success,
    explorerLabel: appCopy.tx.explorer,
    describe: describeAnyError,
  });
}

export function announce(success: string) {
  return (receipt: WriteReceipt<void>) =>
    toasts.show({ tone: "success", title: success, action: { label: appCopy.tx.explorer, href: receipt.explorerUrl } });
}

import { Check, Clock3, X } from "lucide-react";
import Link from "next/link";

import { appCopy } from "@/copy/app.es";
import { shortenAddress } from "@/lib/format/address";
import { categoryLabel } from "@/lib/format/category";
import { formatLedgerTime } from "@/lib/format/date";
import { formatTokenAmount } from "@/lib/format/token";
import { approvalProgress } from "@/lib/treasury/approvals";
import { classNames } from "@/lib/ui/class-names";

import type { ExpenseView } from "../types";

/** Words that describe an expense beyond what the contract stores. Provided by the caller. */
export type ExpenseText = { description: string | null; vendorLabel: string | null };

type ExpenseListProps = {
  expenses: readonly ExpenseView[];
  council: readonly string[];
  threshold: number;
  hrefFor: (id: number) => string;
  /** Description and vendor name, when they were saved off-chain. */
  textFor?: (id: number) => ExpenseText | null;
};

const ICONS = {
  pending: { icon: <Clock3 className="size-4" />, circle: "bg-mist text-ink-soft ring-1 ring-hairline-strong" },
  paid: { icon: <Check className="size-4" strokeWidth={3} />, circle: "bg-royal text-on-royal" },
  cancelled: { icon: <X className="size-4" strokeWidth={3} />, circle: "bg-coral-soft text-wine" },
};

/** Expenses, newest first, each a link to its detail. The status is said in words, not only by color. */
export function ExpenseList({ expenses, council, threshold, hrefFor, textFor }: ExpenseListProps) {
  const { expenses: copy, status } = appCopy;
  return (
    <ul className="divide-y divide-hairline">
      {expenses.map((expense) => {
        const text = textFor?.(expense.id) ?? null;
        const progress = approvalProgress(expense.approvals, council, threshold);
        const look = ICONS[expense.status];
        const vendor = text?.vendorLabel || shortenAddress(expense.vendor);
        return (
          <li key={expense.id}>
            <Link
              href={hrefFor(expense.id)}
              className="group -mx-2 flex items-center gap-4 rounded-control px-2 py-4 transition-colors hover:bg-mist sm:-mx-3 sm:px-3"
            >
              <span
                aria-hidden="true"
                className={classNames("flex size-10 shrink-0 items-center justify-center rounded-full", look.circle)}
              >
                {look.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-semibold text-ink group-hover:text-royal">
                  {text?.description || categoryLabel(expense.category)}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-faint">
                  <span className="font-mono">#{expense.id}</span> · {categoryLabel(expense.category)} · {vendor} ·{" "}
                  {formatLedgerTime(expense.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={classNames(
                    "text-[0.9375rem] font-semibold tabular-nums",
                    expense.status === "cancelled" ? "text-ink-faint line-through" : "text-ink",
                  )}
                >
                  {formatTokenAmount(expense.amount)}
                </p>
                <p className="mt-0.5 text-sm text-ink-faint">
                  {expense.status === "pending" ? copy.signatures(progress.valid, progress.needed) : status[expense.status]}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { AddressTag } from "@/components/molecules/AddressTag";
import { DetailList } from "@/components/molecules/DetailList";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Panel } from "@/components/molecules/Panel";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { ApproveExpenseButton, CancelExpenseButton } from "@/features/expenses";
import { InvoiceCheck } from "@/features/invoice-check";
import { ApprovalTrack, ExpenseStatusBadge } from "@/features/public-view";
import { categoryLabel } from "@/lib/format/category";
import { formatLedgerTime } from "@/lib/format/date";
import { formatTokenAmount } from "@/lib/format/token";
import { accountUrl } from "@/lib/stellar/explorer";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

function BackLink() {
  return (
    <Link
      href={appRoutes.expenses}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-royal"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {appCopy.detail.back}
    </Link>
  );
}

/** One expense: what, to whom, how much, its invoice, its signatures, and what you can do with it. */
export function ExpenseScreen({ idText }: { idText: string }) {
  const { snapshot, expenses, address, permissions, nameFor } = useSession();
  const { detail: copy, expenses: listCopy, tx } = appCopy;
  const config = getConfig();

  if (snapshot.isPending || expenses.isPending) return <ScreenSkeleton rows={2} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;
  if (expenses.isError) return <ReadError error={expenses.error} onRetry={() => void expenses.refetch()} />;

  const id = /^\d+$/.test(idText) ? Number(idText) : -1;
  const expense = expenses.data.find((candidate) => candidate.id === id);

  if (!expense) {
    return (
      <div className="grid gap-6">
        <BackLink />
        <Card padding="lg">
          <EmptyState icon={<FileQuestion className="size-6" />} title={copy.notFoundTitle} body={copy.notFoundBody} />
        </Card>
      </div>
    );
  }

  const treasury = snapshot.data;
  const pending = expense.status === "pending";
  const signed = address !== null && expense.approvals.includes(address);

  return (
    <div className="grid gap-8">
      <BackLink />

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-medium text-ink-faint">{listCopy.number(expense.id)}</span>
            <ExpenseStatusBadge status={expense.status} />
          </div>
          <h1 className="mt-3 text-[length:clamp(1.75rem,3vw,2.375rem)] leading-tight font-semibold tracking-[-0.03em] text-pretty text-ink">
            {categoryLabel(expense.category)}
          </h1>
        </div>
        <p
          className={
            expense.status === "cancelled"
              ? "text-[length:clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.03em] text-ink-faint tabular-nums line-through"
              : "text-[length:clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.03em] text-ink tabular-nums"
          }
        >
          {formatTokenAmount(expense.amount)}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Panel title={copy.infoTitle}>
            <DetailList
              items={[
                { label: copy.category, value: categoryLabel(expense.category) },
                {
                  label: copy.vendor,
                  value: (
                    <AddressTag
                      address={expense.vendor}
                      explorerUrl={accountUrl(config, expense.vendor)}
                      labels={appCopy.address}
                      size="sm"
                    />
                  ),
                },
                { label: copy.proposedAt, value: formatLedgerTime(expense.createdAt) },
                {
                  label: copy.paidAt,
                  value: expense.paidAt ? formatLedgerTime(expense.paidAt) : appCopy.states.notYet,
                },
              ]}
            />
            <div className="mt-6 rounded-control bg-mist px-4 py-3">
              <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{copy.fingerprint}</p>
              <p className="mt-1 font-mono text-sm break-all text-ink">{expense.invoiceHash}</p>
            </div>
          </Panel>

          <Panel title={copy.invoiceTitle}>
            <p className="mb-5 text-sm leading-relaxed text-ink-soft">{copy.invoiceMissing}</p>
            <InvoiceCheck
              single
              candidates={[
                { id: expense.id, invoiceHash: expense.invoiceHash, title: listCopy.number(expense.id) },
              ]}
            />
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title={copy.approvalsTitle}>
            <ApprovalTrack
              approvals={expense.approvals}
              council={treasury.council}
              threshold={treasury.threshold}
              nameFor={nameFor}
            />
          </Panel>

          <Panel title={copy.actionsTitle}>
            {!pending ? (
              <p className="text-sm text-ink-soft">{expense.status === "paid" ? copy.closed.paid : copy.closed.cancelled}</p>
            ) : (
              <div className="grid gap-4">
                {permissions.canApprove &&
                  (signed ? (
                    <p className="rounded-control bg-royal-soft px-4 py-3 text-sm font-medium text-royal">
                      {copy.alreadySigned}
                    </p>
                  ) : (
                    <ApproveExpenseButton expenseId={expense.id} />
                  ))}
                {permissions.canCancel && <CancelExpenseButton expenseId={expense.id} />}
                {!permissions.canApprove && !permissions.canCancel && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {copy.noActions} {address ? null : tx.needsWallet}
                  </p>
                )}
              </div>
            )}
          </Panel>

          <Link href={appRoutes.verify} className={buttonStyles({ variant: "ghost", className: "justify-self-start" })}>
            {appCopy.nav.verify}
          </Link>
        </div>
      </div>
    </div>
  );
}

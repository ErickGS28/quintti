"use client";

import { Fingerprint } from "lucide-react";

import { Card } from "@/components/atoms/Card";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { appCopy } from "@/copy/app.es";
import { InvoiceCheck } from "@/features/invoice-check";
import { categoryLabel } from "@/lib/format/category";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/** Drop an invoice and find the expense it belongs to, if any. Nothing leaves the browser. */
export function VerifyScreen() {
  const { expenses } = useSession();
  const { verify: copy, expenses: listCopy } = appCopy;

  if (expenses.isPending) return <ScreenSkeleton rows={1} />;
  if (expenses.isError) return <ReadError error={expenses.error} onRetry={() => void expenses.refetch()} />;

  const candidates = expenses.data.map((expense) => ({
    id: expense.id,
    invoiceHash: expense.invoiceHash,
    title: `${listCopy.number(expense.id)} · ${categoryLabel(expense.category)}`,
  }));

  return (
    <div className="grid gap-8">
      <PageHeader title={copy.title} description={copy.description} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel title={copy.title} className="min-w-0">
          <InvoiceCheck candidates={candidates} hrefFor={appRoutes.expense} />
        </Panel>
        <Card padding="md" className="self-start">
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-royal-soft text-royal">
            <Fingerprint className="size-5" />
          </span>
          <p className="mt-4 font-semibold text-ink">{copy.how}</p>
          <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-soft">{copy.howBody}</p>
        </Card>
      </div>
    </div>
  );
}

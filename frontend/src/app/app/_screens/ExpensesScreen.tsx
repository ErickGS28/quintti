"use client";

import { Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SegmentedControl } from "@/components/molecules/SegmentedControl";
import { appCopy } from "@/copy/app.es";
import { ExpenseList, type ExpenseStatusView } from "@/features/public-view";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

type Filter = "all" | ExpenseStatusView;

/** Every expense, newest first, filtered by state. */
export function ExpensesScreen() {
  const { snapshot, expenses, permissions } = useSession();
  const [filter, setFilter] = useState<Filter>("all");
  const { expenses: copy } = appCopy;

  if (snapshot.isPending || expenses.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;
  if (expenses.isError) return <ReadError error={expenses.error} onRetry={() => void expenses.refetch()} />;

  const all = [...expenses.data].reverse();
  const count = (status: ExpenseStatusView) => all.filter((expense) => expense.status === status).length;
  const shown = filter === "all" ? all : all.filter((expense) => expense.status === filter);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={copy.title}
        actions={
          permissions.canPropose && (
            <Link href={appRoutes.propose} className={buttonStyles({ size: "lg", shape: "pill" })}>
              <Plus className="size-4" aria-hidden="true" />
              {copy.propose}
            </Link>
          )
        }
      />

      <SegmentedControl<Filter>
        label={copy.filterLabel}
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: copy.filters.all, count: all.length },
          { value: "pending", label: copy.filters.pending, count: count("pending") },
          { value: "paid", label: copy.filters.paid, count: count("paid") },
          { value: "cancelled", label: copy.filters.cancelled, count: count("cancelled") },
        ]}
      />

      <Card padding="md" className="sm:px-6">
        {shown.length ? (
          <ExpenseList
            expenses={shown}
            council={snapshot.data.council}
            threshold={snapshot.data.threshold}
            hrefFor={appRoutes.expense}
          />
        ) : (
          <EmptyState
            icon={<ReceiptText className="size-6" />}
            title={all.length ? copy.emptyFiltered : copy.emptyTitle}
            body={all.length ? undefined : copy.emptyBody}
          />
        )}
      </Card>
    </div>
  );
}

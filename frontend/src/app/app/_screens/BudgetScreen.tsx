"use client";

import { Landmark, Lock, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { StatCard } from "@/components/molecules/StatCard";
import { appCopy } from "@/copy/app.es";
import { BudgetLineForm } from "@/features/governance";
import { BudgetLines } from "@/features/public-view";
import { formatTokenAmount } from "@/lib/format/token";

import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/** The limits the assembly approved, what was paid against each, and, for the assembly, a way to change them. */
export function BudgetScreen() {
  const { snapshot, permissions } = useSession();
  const [editing, setEditing] = useState<string>("");
  const { budget: copy } = appCopy;

  if (snapshot.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const { budgets } = snapshot.data;
  const totals = budgets.reduce(
    (sum, line) => ({ limit: sum.limit + line.limit, spent: sum.spent + line.spent }),
    { limit: 0n, spent: 0n },
  );

  return (
    <div className="grid gap-8">
      <PageHeader title={copy.title} description={copy.description} />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label={copy.limit} value={formatTokenAmount(totals.limit)} />
        <StatCard label={copy.spent} value={formatTokenAmount(totals.spent)} />
        <StatCard label={copy.remaining} value={formatTokenAmount(totals.limit - totals.spent)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title={copy.title} className="min-w-0">
          {budgets.length ? (
            <BudgetLines
              budgets={budgets}
              detailed
              trailing={
                permissions.canManageRules
                  ? (line) => (
                      <Button variant="ghost" onClick={() => setEditing(line.category)}>
                        <Pencil className="size-3.5" aria-hidden="true" />
                        {copy.edit}
                      </Button>
                    )
                  : undefined
              }
            />
          ) : (
            <EmptyState icon={<Landmark className="size-6" />} title={copy.emptyTitle} body={copy.emptyBody} />
          )}
        </Panel>

        {permissions.canManageRules ? (
          <Panel title={copy.formTitle} description={copy.formBody} className="self-start">
            <BudgetLineForm key={editing} category={editing} />
          </Panel>
        ) : (
          <Card padding="md" className="flex items-start gap-3 self-start">
            <Lock className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-ink-soft">{copy.onlyAssembly}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

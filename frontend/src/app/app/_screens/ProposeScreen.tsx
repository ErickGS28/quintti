"use client";

import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { appCopy } from "@/copy/app.es";
import { ProposeExpenseForm } from "@/features/expenses";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/** Proposing an expense. The form lives in the expenses feature; this screen only decides who may see it. */
export function ProposeScreen() {
  const { snapshot, permissions } = useSession();
  const { propose: copy } = appCopy;

  if (snapshot.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const header = (
    <>
      <Link
        href={appRoutes.expenses}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-royal"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {appCopy.detail.back}
      </Link>
      <PageHeader title={copy.title} description={copy.description} />
    </>
  );

  if (!permissions.canPropose) {
    return (
      <div className="grid gap-8">
        {header}
        <Card padding="lg">
          <EmptyState
            icon={<Lock className="size-6" />}
            title={copy.onlyAdministrator.title}
            body={copy.onlyAdministrator.body}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {header}
      <ProposeExpenseForm
        budgets={snapshot.data.budgets}
        vendors={snapshot.data.vendors}
        expenseHref={appRoutes.expense}
      />
    </div>
  );
}

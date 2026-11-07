"use client";

import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { appCopy } from "@/copy/app.es";
import { ProposeExpenseForm, type AfterProposal, type ProposalExtras } from "@/features/expenses";
import { canUploadInvoice, useAttachExpenseDetails } from "@/features/expense-details";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/**
 * Proposing an expense. The form lives in the expenses feature; this screen joins it with the
 * off-chain details, so the description and the invoice are saved right after the proposal.
 */
export function ProposeScreen() {
  const { snapshot, details, permissions, vendorNameFor } = useSession();
  const attach = useAttachExpenseDetails();
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

  async function afterProposal(expenseId: number, extras: ProposalExtras): Promise<AfterProposal> {
    if (!canUploadInvoice(extras.invoice)) return "skipped";
    await attach.mutateAsync({ expenseId, ...extras });
    return "saved";
  }

  const vendors = snapshot.data.vendors.map((address) => ({ address, label: vendorNameFor(address) }));

  return (
    <div className="grid gap-8">
      {header}
      <ProposeExpenseForm
        budgets={snapshot.data.budgets}
        vendors={vendors}
        detailsEnabled={details.configured}
        afterProposal={afterProposal}
        expenseHref={appRoutes.expense}
      />
    </div>
  );
}

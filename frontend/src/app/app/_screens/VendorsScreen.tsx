"use client";

import { Lock, Store } from "lucide-react";

import { Card } from "@/components/atoms/Card";
import { AddressTag } from "@/components/molecules/AddressTag";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { RemoveVendorButton, VendorForm } from "@/features/governance";
import { formatTokenAmount } from "@/lib/format/token";
import { accountUrl } from "@/lib/stellar/explorer";

import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/** The accounts that may be paid, what each has received, and, for the assembly, a way to change the list. */
export function VendorsScreen() {
  const { snapshot, expenses, permissions } = useSession();
  const { vendors: copy } = appCopy;
  const config = getConfig();

  if (snapshot.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const paid = (vendor: string) => {
    const payments = (expenses.data ?? []).filter((expense) => expense.vendor === vendor && expense.status === "paid");
    return { count: payments.length, total: payments.reduce((sum, expense) => sum + expense.amount, 0n) };
  };

  return (
    <div className="grid gap-8">
      <PageHeader title={copy.title} description={copy.description} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title={copy.title} className="min-w-0">
          {snapshot.data.vendors.length ? (
            <ul className="divide-y divide-hairline">
              {snapshot.data.vendors.map((vendor) => {
                const { count, total } = paid(vendor);
                return (
                  <li key={vendor} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <AddressTag
                        address={vendor}
                        explorerUrl={accountUrl(config, vendor)}
                        labels={appCopy.address}
                      />
                    </div>
                    <p className="text-sm text-ink-soft tabular-nums sm:text-right">{copy.paid(count, formatTokenAmount(total))}</p>
                    {permissions.canManageRules && <RemoveVendorButton vendor={vendor} />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={<Store className="size-6" />} title={copy.emptyTitle} body={copy.emptyBody} />
          )}
        </Panel>

        {permissions.canManageRules ? (
          <Panel title={copy.formTitle} description={copy.formBody} className="self-start">
            <VendorForm />
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

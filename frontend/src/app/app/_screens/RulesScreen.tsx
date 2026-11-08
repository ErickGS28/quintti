"use client";

import { Landmark, Pencil, Store } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { AddressTag } from "@/components/molecules/AddressTag";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { BudgetLineForm, RemoveVendorButton, VendorForm } from "@/features/governance";
import { BudgetLines } from "@/features/public-view";
import { formatTokenAmount } from "@/lib/format/token";
import { accountUrl } from "@/lib/stellar/explorer";

import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/** A divider and a titled form, for the panels the assembly can change. */
function Editor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-hairline pt-5">
      <p className="mb-4 font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

/**
 * The rules in one place: the budget, the approved vendors and who decides. Everyone reads them;
 * the assembly also gets the forms to change the budget and the vendors.
 */
export function RulesScreen() {
  const { snapshot, expenses, permissions, nameFor } = useSession();
  const [editing, setEditing] = useState("");
  const { rules: copy, budget, vendors, roles } = appCopy;
  const config = getConfig();

  if (snapshot.isPending) return <ScreenSkeleton rows={2} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const treasury = snapshot.data;
  const paid = (vendor: string) => {
    const payments = (expenses.data ?? []).filter((expense) => expense.vendor === vendor && expense.status === "paid");
    return { count: payments.length, total: payments.reduce((sum, expense) => sum + expense.amount, 0n) };
  };
  const tag = (address: string, role: string) => {
    const name = nameFor(address);
    return (
      <AddressTag
        address={address}
        name={name}
        role={name === role ? undefined : role}
        explorerUrl={accountUrl(config, address)}
        labels={appCopy.address}
        size="sm"
      />
    );
  };

  return (
    <div className="grid gap-8">
      <PageHeader title={copy.title} description={copy.description} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Panel title={copy.budgetTitle}>
            {treasury.budgets.length ? (
              <BudgetLines
                budgets={treasury.budgets}
                detailed
                trailing={
                  permissions.canManageRules
                    ? (line) => (
                        <Button variant="ghost" onClick={() => setEditing(line.category)}>
                          <Pencil className="size-3.5" aria-hidden="true" />
                          {budget.edit}
                        </Button>
                      )
                    : undefined
                }
              />
            ) : (
              <EmptyState icon={<Landmark className="size-6" />} title={budget.emptyTitle} body={budget.emptyBody} />
            )}
            {permissions.canManageRules && (
              <Editor title={budget.formTitle}>
                <BudgetLineForm key={editing} category={editing} />
              </Editor>
            )}
          </Panel>

          <Panel title={copy.vendorsTitle}>
            {treasury.vendors.length ? (
              <ul className="divide-y divide-hairline">
                {treasury.vendors.map((vendor) => {
                  const { count, total } = paid(vendor);
                  return (
                    <li key={vendor} className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <AddressTag
                          address={vendor}
                          explorerUrl={accountUrl(config, vendor)}
                          labels={appCopy.address}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-ink-soft tabular-nums">{vendors.paid(count, formatTokenAmount(total))}</p>
                      {permissions.canManageRules && <RemoveVendorButton vendor={vendor} />}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={<Store className="size-6" />} title={vendors.emptyTitle} body={vendors.emptyBody} />
            )}
            {permissions.canManageRules && (
              <Editor title={vendors.formTitle}>
                <VendorForm />
              </Editor>
            )}
          </Panel>
        </div>

        <Panel title={copy.whoTitle} className="self-start">
          <ul className="grid gap-4">
            <li>{tag(treasury.assembly, roles.assembly)}</li>
            <li>{tag(treasury.administrator, roles.administrator)}</li>
            <li className="border-t border-hairline pt-4">
              <p className="mb-3 text-sm font-semibold text-ink">
                {roles.council} · {copy.councilLine(treasury.threshold, treasury.council.length)}
              </p>
              <div className="grid gap-3">
                {treasury.council.map((member) => (
                  <div key={member}>{tag(member, roles.council)}</div>
                ))}
              </div>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

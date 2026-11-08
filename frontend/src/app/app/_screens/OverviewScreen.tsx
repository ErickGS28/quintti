"use client";

import { ArrowRight, Clock3, Landmark, Plus, ReceiptText, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/atoms/Button";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { AddressTag } from "@/components/molecules/AddressTag";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { StatCard } from "@/components/molecules/StatCard";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { ExpenseList } from "@/features/public-view";
import { formatTokenAmount } from "@/lib/format/token";
import { accountUrl } from "@/lib/stellar/explorer";
import { spentShare } from "@/lib/treasury/approvals";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

const RECENT = 5;

/** What the connected account can do here, and the shortest way to do it. */
function RolePanel() {
  const { address, permissions } = useSession();
  const { role } = appCopy;

  const content = permissions.canManageRules
    ? { ...role.assembly, href: appRoutes.rules }
    : permissions.canPropose
      ? { ...role.administrator, href: appRoutes.propose }
      : permissions.canApprove
        ? { ...role.council, href: appRoutes.expenses }
        : address
          ? { ...role.connectedResident, href: null, action: null }
          : { ...role.visitor, href: null, action: null };

  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-royal to-royal-strong p-5 text-on-royal shadow-float sm:p-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-lavender/40 blur-2xl"
      />
      <p className="relative font-mono text-xs tracking-[0.12em] text-periwinkle-soft uppercase">{role.title}</p>
      <p className="relative mt-3 text-lg font-semibold text-on-royal">{content.title}</p>
      <p className="relative mt-1.5 text-sm leading-relaxed text-pretty text-royal-soft">{content.body}</p>
      {content.href && content.action && (
        <Link href={content.href} className={buttonStyles({ variant: "light", className: "relative mt-4" })}>
          {content.action}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** The building at a glance: money, what waits for signatures, the latest expenses and who decides. */
export function OverviewScreen() {
  const { snapshot, expenses, permissions, nameFor } = useSession();
  const { overview, roles, address: addressCopy } = appCopy;
  const config = getConfig();

  if (snapshot.isPending) return <ScreenSkeleton />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const treasury = snapshot.data;
  const totals = treasury.budgets.reduce(
    (sum, line) => ({ limit: sum.limit + line.limit, spent: sum.spent + line.spent }),
    { limit: 0n, spent: 0n },
  );
  const list = expenses.data ?? [];
  const pending = list.filter((expense) => expense.status === "pending").length;
  const recent = [...list].reverse().slice(0, RECENT);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={appCopy.building.fallbackName}
        actions={
          permissions.canPropose && (
            <Link href={appRoutes.propose} className={buttonStyles({ size: "lg", shape: "pill" })}>
              <Plus className="size-4" aria-hidden="true" />
              {appCopy.expenses.propose}
            </Link>
          )
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-label={overview.balance}>
        <StatCard label={overview.balance} value={formatTokenAmount(treasury.balance)} icon={<Wallet className="size-4" />} />
        <StatCard
          label={overview.used}
          value={formatTokenAmount(totals.spent)}
          hint={overview.usedHint(formatTokenAmount(totals.limit))}
          icon={<Landmark className="size-4" />}
        >
          <ProgressBar value={spentShare(totals)} />
        </StatCard>
        <StatCard label={overview.pending} value={pending} icon={<Clock3 className="size-4" />} />
        <StatCard
          label={overview.threshold}
          value={overview.thresholdValue(treasury.threshold, treasury.council.length)}
          icon={<ShieldCheck className="size-4" />}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Panel
          title={overview.recentTitle}
          className="min-w-0 self-start"
          action={
            list.length > 0 && (
              <Link
                href={appRoutes.expenses}
                className="inline-flex items-center gap-1 text-sm font-semibold text-royal hover:underline"
              >
                {overview.recentLink}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )
          }
        >
          {recent.length ? (
            <ExpenseList
              expenses={recent}
              council={treasury.council}
              threshold={treasury.threshold}
              hrefFor={appRoutes.expense}
            />
          ) : (
            <EmptyState
              icon={<ReceiptText className="size-6" />}
              title={appCopy.expenses.emptyTitle}
              body={appCopy.expenses.emptyBody}
            />
          )}
        </Panel>

        <div className="grid content-start gap-6">
          <RolePanel />

          <Panel title={overview.whoTitle}>
            <ul className="grid gap-4">
              {[
                { address: treasury.assembly, role: roles.assembly },
                { address: treasury.administrator, role: roles.administrator },
                ...treasury.council.map((member) => ({ address: member, role: roles.council })),
              ].map(({ address, role }) => {
                const name = nameFor(address);
                return (
                  <li key={`${role}-${address}`}>
                    <AddressTag
                      address={address}
                      name={name}
                      role={name === role ? undefined : role}
                      explorerUrl={accountUrl(config, address)}
                      labels={addressCopy}
                      size="sm"
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

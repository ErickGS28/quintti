"use client";

import { ArrowLeft, Lock, Wallet } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/atoms/Card";
import { EmptyState } from "@/components/molecules/EmptyState";
import { PageHeader } from "@/components/molecules/PageHeader";
import { appCopy } from "@/copy/app.es";
import { DepositForm } from "@/features/funding";
import { useBuilding } from "@/lib/buildings/building-context";

import { appRoutes } from "../_shell/routes";
import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

/**
 * Putting money into the building. Anyone with a wallet may, so unlike proposing it needs no role. What it
 * does need is a building the person has saved: a link can point at a contract that only looks like theirs,
 * and a deposit cannot be taken back.
 */
export function DepositScreen() {
  const { snapshot, address } = useSession();
  const { href, trusted } = useBuilding();
  const { deposit: copy } = appCopy;

  if (snapshot.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const header = (
    <>
      <Link
        href={href(appRoutes.overview)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-royal"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {appCopy.nav.overview}
      </Link>
      <PageHeader title={copy.title} description={copy.description} />
    </>
  );

  if (!trusted) {
    return (
      <div className="grid gap-8">
        {header}
        <Card padding="lg">
          <EmptyState icon={<Lock className="size-6" />} title={copy.untrustedTitle} body={copy.untrustedBody} />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {header}
      {!address && (
        <Card padding="md">
          <EmptyState icon={<Wallet className="size-6" />} title={copy.connectTitle} body={copy.connectBody} />
        </Card>
      )}
      <DepositForm
        payer={address}
        token={snapshot.data.token}
        balance={snapshot.data.balance}
        allowed={trusted}
        overviewHref={href(appRoutes.overview)}
      />
    </div>
  );
}
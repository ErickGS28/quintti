"use client";

import { Gavel, Lock, PenLine, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { AddressTag } from "@/components/molecules/AddressTag";
import { PageHeader } from "@/components/molecules/PageHeader";
import { Panel } from "@/components/molecules/Panel";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { AdministratorForm, CouncilForm } from "@/features/governance";
import { accountUrl } from "@/lib/stellar/explorer";

import { useSession } from "../_shell/session";
import { ReadError, ScreenSkeleton } from "./states";

function RoleCard({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children: ReactNode }) {
  return (
    <Card padding="md" spotlight className="flex flex-col">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-royal-soft text-royal">
          {icon}
        </span>
        <p className="text-lg font-semibold tracking-tight text-ink">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-soft">{body}</p>
      <div className="mt-5 grid gap-3">{children}</div>
    </Card>
  );
}

/** Who holds each role, and, for the assembly, a way to replace the administrator or renew the council. */
export function CouncilScreen() {
  const { snapshot, permissions, nameFor } = useSession();
  const { council: copy, roles } = appCopy;
  const config = getConfig();

  if (snapshot.isPending) return <ScreenSkeleton rows={1} />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const treasury = snapshot.data;
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

      <section className="grid gap-4 lg:grid-cols-3">
        <RoleCard icon={<Gavel className="size-5" />} title={copy.assembly} body={copy.assemblyBody}>
          {tag(treasury.assembly, roles.assembly)}
        </RoleCard>
        <RoleCard icon={<PenLine className="size-5" />} title={copy.administrator} body={copy.administratorBody}>
          {tag(treasury.administrator, roles.administrator)}
        </RoleCard>
        <RoleCard
          icon={<ShieldCheck className="size-5" />}
          title={copy.councilTitle}
          body={copy.councilBody(treasury.threshold, treasury.council.length)}
        >
          <ProgressBar value={treasury.council.length ? treasury.threshold / treasury.council.length : 0} />
          {treasury.council.map((member) => (
            <div key={member}>{tag(member, roles.council)}</div>
          ))}
        </RoleCard>
      </section>

      {permissions.canManageRules ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title={copy.adminFormTitle} className="self-start">
            <AdministratorForm />
          </Panel>
          <Panel title={copy.councilFormTitle} className="self-start">
            <CouncilForm council={treasury.council} threshold={treasury.threshold} />
          </Panel>
        </div>
      ) : (
        <Card padding="md" className="flex items-start gap-3">
          <Lock className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink-soft">{copy.onlyAssembly}</p>
        </Card>
      )}
    </div>
  );
}

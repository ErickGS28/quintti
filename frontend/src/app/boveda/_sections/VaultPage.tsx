"use client";

import { ArrowRight, Check, Coins, KeyRound, Users } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/atoms/BrandMark";
import { buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { PageWash } from "@/components/atoms/PageWash";
import { Skeleton } from "@/components/atoms/Skeleton";
import { AddressTag } from "@/components/molecules/AddressTag";
import { ErrorState } from "@/components/molecules/ErrorState";
import { StatCard } from "@/components/molecules/StatCard";
import { getConfig } from "@/config/env";
import { getVaultSetting } from "@/config/vault";
import { appCopy } from "@/copy/app.es";
import { vaultCopy } from "@/copy/boveda.es";
import { describeAnyError } from "@/copy/errors.es";
import { VaultClaimCard, useVaultState } from "@/features/vault";
import { WalletPanel, useWalletSession } from "@/features/wallet-session";
import { formatTokenAmount } from "@/lib/format/token";
import { contractUrl } from "@/lib/stellar/explorer";

const { header, stats, contract, rules, notReady, readError } = vaultCopy;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh">
      <PageWash />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <BrandMark className="size-9" />
          <span className="text-lg font-semibold tracking-tight text-ink">{vaultCopy.topbar.home}</span>
        </Link>
        <Link href="/app" className={buttonStyles({ shape: "pill" })}>
          {vaultCopy.topbar.open}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <header className="pt-10 pb-10 sm:pt-16">
          <Eyebrow className="text-royal" dot="live">
            {header.eyebrow}
          </Eyebrow>
          <h1 className="mt-5 text-[length:clamp(2.5rem,6vw,4.5rem)] leading-[1] font-bold tracking-[-0.04em] text-balance text-ink">
            {header.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-pretty text-ink-soft">{header.body}</p>
        </header>
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-sm text-ink-faint sm:px-8">{vaultCopy.footer}</footer>
    </div>
  );
}

/**
 * The page at `/boveda`: what the Ship It vault holds, who has claimed, and the form that claims. Reading
 * needs no wallet; claiming needs one on the app's network.
 */
export function VaultPage() {
  const setting = getVaultSetting();

  if (setting.status !== "ready") {
    const missing = setting.status === "missing";
    return (
      <Shell>
        <Card padding="lg">
          <ErrorState
            title={missing ? notReady.missingTitle : notReady.invalidTitle}
            message={missing ? notReady.missingBody : notReady.invalidBody}
          />
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <VaultContent contractId={setting.contractId} />
    </Shell>
  );
}

function VaultContent({ contractId }: { contractId: string }) {
  const state = useVaultState(contractId);
  const { state: session } = useWalletSession();
  const address = session.status === "connected" ? session.address : null;
  const config = getConfig();

  return (
    <div className="grid gap-8">
      <section aria-label="Estado de la bóveda" className="grid gap-4 sm:grid-cols-3">
        {state.isPending ? (
          [0, 1, 2].map((slot) => <Skeleton key={slot} className="h-36 w-full rounded-card" />)
        ) : state.isError ? (
          <Card padding="lg" className="sm:col-span-3">
            <ErrorState
              title={readError.title}
              message={describeAnyError(state.error)}
              retry={{ label: readError.retry, onRetry: () => void state.refetch() }}
            />
          </Card>
        ) : (
          <>
            <StatCard label={stats.held} value={formatTokenAmount(state.data.balance)} icon={<Coins className="size-4" />} />
            <StatCard
              label={stats.payout}
              value={formatTokenAmount(state.data.payout)}
              hint={stats.payoutHint}
              icon={<KeyRound className="size-4" />}
            />
            <StatCard
              label={stats.claims}
              value={state.data.claims}
              hint={stats.claimsHint(state.data.claims)}
              icon={<Users className="size-4" />}
            />
          </>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <VaultClaimCard
          contractId={contractId}
          address={address}
          connect={<WalletPanel roleNames={[]} variant="compact" />}
        />

        <div className="grid gap-6">
          <Card padding="md">
            <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{contract.label}</p>
            <div className="mt-3">
              <AddressTag
                address={contractId}
                explorerUrl={contractUrl(config, contractId)}
                labels={appCopy.address}
              />
            </div>
            <a
              href={contractUrl(config, contractId)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-royal hover:underline"
            >
              {contract.explorer}
            </a>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{rules.title}</h2>
            <ul className="mt-4 grid gap-3">
              {rules.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink-soft">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-royal text-on-royal"
                  >
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

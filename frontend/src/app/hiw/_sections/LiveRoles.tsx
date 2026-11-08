"use client";

import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { Skeleton } from "@/components/atoms/Skeleton";
import { AddressTag } from "@/components/molecules/AddressTag";
import { Panel } from "@/components/molecules/Panel";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { hiwCopy } from "@/copy/hiw.es";
import { useTreasurySnapshot } from "@/features/public-view";
import { WalletPanel, useWalletSession } from "@/features/wallet-session";
import { formatTokenAmount } from "@/lib/format/token";
import { accountUrl, contractUrl } from "@/lib/stellar/explorer";
import { rolesOf } from "@/lib/treasury/roles";

import { ReadError } from "../../app/_screens/states";

const { live } = hiwCopy.trial;

/**
 * Who holds each role in the deployed contract, read from the contract itself, so whoever tests the
 * app knows which account to import. If a wallet is connected, its own role is marked.
 */
export function LiveRoles() {
  const snapshot = useTreasurySnapshot();
  const { state } = useWalletSession();
  const address = state.status === "connected" ? state.address : null;

  if (snapshot.isPending) return <Skeleton className="h-64 w-full rounded-card" />;
  if (snapshot.isError) return <ReadError error={snapshot.error} onRetry={() => void snapshot.refetch()} />;

  const config = getConfig();
  const treasury = snapshot.data;
  const roles = rolesOf(address, treasury);
  const roleNames = roles.map((role) => appCopy.roles[role]);
  const rows: Array<{ label: string; addresses: readonly string[] }> = [
    { label: live.assembly, addresses: [treasury.assembly] },
    { label: live.administrator, addresses: [treasury.administrator] },
    { label: live.council(treasury.threshold, treasury.council.length), addresses: treasury.council },
  ];

  return (
    <Panel
      title={live.title}
      action={<WalletPanel roleNames={roleNames} variant="compact" />}
      description={
        address === null ? live.connect : roles.length === 0 ? live.noRole : `${appCopy.wallet.you}: ${roleNames.join(", ")}`
      }
    >
      <dl className="grid gap-5">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{row.label}</dt>
            <dd className="mt-2 grid gap-2">
              {row.addresses.map((member) => (
                <div key={member} className="flex flex-wrap items-center gap-3">
                  <AddressTag
                    address={member}
                    explorerUrl={accountUrl(config, member)}
                    labels={appCopy.address}
                    size="sm"
                  />
                  {member === address && <Badge tone="royal">{live.you}</Badge>}
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-control bg-mist px-4 py-3">
        <p className="text-sm text-ink-soft">
          {live.balance}: <span className="font-semibold text-ink tabular-nums">{formatTokenAmount(treasury.balance)}</span>
        </p>
        <a
          href={contractUrl(config, config.treasuryContractId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline"
        >
          {live.contract}
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </Panel>
  );
}

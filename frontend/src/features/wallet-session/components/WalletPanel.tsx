"use client";

import { LogOut, Wallet } from "lucide-react";

import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { appCopy } from "@/copy/app.es";
import { describeError } from "@/copy/errors.es";
import { shortenAddress } from "@/lib/format/address";

import { useWalletSession } from "../hooks/use-wallet-session";

type WalletPanelProps = {
  /** The names of the roles the connected account holds, already in words. */
  roleNames: readonly string[];
  /** "panel" for the sidebar; "compact" for the mobile top bar. */
  variant?: "panel" | "compact";
};

/**
 * Connect a wallet through Stellar Wallets Kit, see who is connected and with which roles, and
 * disconnect. A closed wallet prompt is not an error screen: it only says nothing changed.
 */
export function WalletPanel({ roleNames, variant = "panel" }: WalletPanelProps) {
  const { state, connect, disconnect } = useWalletSession();
  const { wallet } = appCopy;

  if (variant === "compact") {
    if (state.status === "connected") {
      return (
        <span className="flex items-center gap-2 rounded-full bg-cloud py-1 pr-3 pl-1 shadow-card">
          <Avatar address={state.address} className="size-8" />
          <span className="font-mono text-xs font-medium text-ink">{shortenAddress(state.address)}</span>
        </span>
      );
    }
    return (
      <Button size="md" shape="pill" onClick={() => void connect()} disabled={state.status === "connecting"}>
        {state.status === "connecting" ? <Spinner className="size-4" /> : <Wallet className="size-4" aria-hidden="true" />}
        {wallet.connectShort}
      </Button>
    );
  }

  if (state.status === "connected") {
    return (
      <div className="rounded-card bg-mist p-3">
        <p className="px-1 font-mono text-[0.6875rem] font-medium tracking-[0.12em] text-ink-faint uppercase">{wallet.you}</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar address={state.address} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-semibold text-ink" title={state.address}>
              {shortenAddress(state.address, 5, 5)}
            </p>
            <p className="truncate text-xs text-ink-soft">{roleNames.length ? roleNames.join(" · ") : wallet.noRole}</p>
          </div>
          <button
            type="button"
            onClick={() => void disconnect()}
            aria-label={wallet.disconnect}
            title={wallet.disconnect}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-cloud hover:text-wine"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Button fullWidth onClick={() => void connect()} disabled={state.status === "connecting"}>
        {state.status === "connecting" ? <Spinner className="size-4" /> : <Wallet className="size-4" aria-hidden="true" />}
        {state.status === "connecting" ? wallet.connecting : wallet.connect}
      </Button>
      {state.status === "failed" ? (
        <p role="alert" className="px-1 text-xs leading-relaxed text-wine">
          {describeError(state.error)}
        </p>
      ) : (
        <p className="px-1 text-xs leading-relaxed text-ink-faint">{wallet.connectHint}</p>
      )}
    </div>
  );
}

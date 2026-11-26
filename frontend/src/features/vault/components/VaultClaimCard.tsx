"use client";

import { CircleCheck, KeyRound, Lock } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { describeVaultError, vaultCopy } from "@/copy/boveda.es";
import { formatTokenAmount } from "@/lib/format/token";
import { shortenAddress } from "@/lib/format/address";

import { useClaimAction, useHasClaimed } from "../hooks/use-vault";

type VaultClaimCardProps = {
  /** The vault's contract address. */
  contractId: string;
  /** The connected account, who would be paid. Null when nobody is connected. */
  address: string | null;
  /** The control that connects a wallet. A feature cannot reach the wallet's own feature, so the page passes it. */
  connect: ReactNode;
};

/**
 * The claim: connect a wallet, write the code, and receive a share. A wrong code is caught while the
 * transaction is only simulated, so the wallet is never asked to sign it.
 */
export function VaultClaimCard({ contractId, address, connect }: VaultClaimCardProps) {
  const { claim: copy } = vaultCopy;
  const action = useClaimAction(contractId);
  const claimed = useHasClaimed(contractId, address);
  const [code, setCode] = useState("");

  const alreadyClaimed = claimed.data === true;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!address || action.isPending) return;
    action.mutate({ code });
  }

  if (action.isSuccess && action.data) {
    return (
      <Card padding="lg" className="text-center">
        <span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-royal text-on-royal">
          <CircleCheck className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
          {copy.successTitle(formatTokenAmount(action.data.value))}
        </h2>
        <div className="mt-5 text-left">
          <TxFeedback
            state={{
              status: "success",
              message: copy.successBody,
              link: { label: copy.explorer, href: action.data.explorerUrl },
            }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{copy.title}</h2>
        <p className="mt-2 leading-relaxed text-pretty text-ink-soft">{copy.body}</p>
      </div>

      <div className="grid gap-3">
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{copy.connectTitle}</p>
        <div className="flex flex-wrap items-center gap-3">
          {connect}
          {address ? (
            <span className="text-sm text-ink-soft">
              {copy.wallet}: <span className="font-mono font-medium text-ink">{shortenAddress(address, 5, 5)}</span>
            </span>
          ) : (
            <span className="text-sm text-ink-faint">{copy.connectBody}</span>
          )}
        </div>
      </div>

      {alreadyClaimed ? (
        <div className="flex items-start gap-3 rounded-control bg-mist px-4 py-3">
          <Lock className="mt-0.5 size-4 shrink-0 text-ink-soft" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">{copy.alreadyTitle}</p>
            <p className="mt-0.5 text-sm text-ink-soft">{copy.alreadyBody}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{copy.codeTitle}</p>
          <FormField label={copy.codeLabel} hint={copy.codeHint}>
            {(control) => (
              <Input
                {...control}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={copy.codePlaceholder}
                value={code}
                disabled={!address || action.isPending}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (action.isError) action.reset();
                }}
              />
            )}
          </FormField>

          {action.isPending && <TxFeedback state={{ status: "pending", message: copy.pending }} />}
          {action.isError && <TxFeedback state={{ status: "error", message: describeVaultError(action.error) }} />}

          <Button type="submit" size="lg" disabled={!address || !code.trim() || action.isPending} className="w-full sm:w-auto sm:justify-self-end">
            <KeyRound className="size-4" aria-hidden="true" />
            {action.isPending ? copy.submitting : copy.submit}
          </Button>
        </form>
      )}
    </Card>
  );
}

"use client";

import { ArrowRight, Check, CircleCheck, Coins, X } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button, buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { AmountFormatError, parseAmount } from "@/lib/format/amount";
import { formatTokenAmount, tokenDecimals, tokenSymbol } from "@/lib/format/token";
import { classNames } from "@/lib/ui/class-names";
import { toasts } from "@/lib/ui/toast-store";
import { txFeedbackFor } from "@/lib/ui/tx-feedback";

import { useDepositAction } from "../hooks/use-deposit-action";
import { useTokenBalance } from "../hooks/use-token-balance";

type DepositFormProps = {
  /** The connected account, who pays. Null when nobody is connected. */
  payer: string | null;
  /** The contract of the building's token, to read what the payer holds. */
  token: string | undefined;
  /** What the treasury holds now, to show what it would hold after. */
  balance: bigint;
  /** Whether signing is allowed on this building: false for one opened from a link and not saved. */
  allowed: boolean;
  overviewHref: string;
};

function readAmount(text: string): bigint | null {
  try {
    return parseAmount(text, tokenDecimals());
  } catch (error) {
    if (error instanceof AmountFormatError) return null;
    throw error;
  }
}

/**
 * Puts money into the treasury. The page shows what the payer holds and what the treasury would hold, and
 * checks before asking for a signature, so a deposit that would fail is caught here and not in the wallet.
 */
export function DepositForm({ payer, token, balance, allowed, overviewHref }: DepositFormProps) {
  const { deposit: copy, tx } = appCopy;
  const deposit = useDepositAction();
  const held = useTokenBalance(token, payer);

  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState<string | undefined>();

  const amount = readAmount(amountText);
  const validAmount = amount !== null && amount > 0n;
  // Only a balance that was actually read can say "not enough". A failed read must not block the person.
  const affords = validAmount && held.data !== undefined ? amount <= held.data : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validAmount) return setError(copy.amountHint);
    if (affords === false) return setError(copy.noFunds);
    setError(undefined);

    const receipt = await deposit.mutateAsync({ amount }).catch(() => null);
    if (!receipt) return;
    toasts.show({
      tone: "success",
      title: copy.done(formatTokenAmount(amount)),
      action: { label: tx.explorer, href: receipt.explorerUrl },
    });
  }

  function reset() {
    deposit.reset();
    setAmountText("");
    setError(undefined);
  }

  if (deposit.isSuccess && deposit.data && amount !== null) {
    return (
      <Card padding="lg" className="mx-auto max-w-xl text-center">
        <span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-royal text-on-royal">
          <CircleCheck className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{copy.done(formatTokenAmount(amount))}</h2>
        <div className="mt-5 text-left">
          <TxFeedback
            state={{
              status: "success",
              message: copy.doneBody,
              link: { label: tx.explorer, href: deposit.data.explorerUrl },
            }}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={overviewHref} className={buttonStyles({ size: "lg", shape: "pill" })}>
            {copy.backToOverview}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Button variant="soft" size="lg" shape="pill" onClick={reset}>
            {copy.another}
          </Button>
        </div>
      </Card>
    );
  }

  const feedback = txFeedbackFor(deposit, {
    pending: tx.pending,
    success: copy.submit,
    explorerLabel: tx.explorer,
    describe: describeAnyError,
  });

  const checks = [
    { label: copy.checks.wallet, ok: payer ? true : null },
    { label: copy.checks.amount, ok: amountText.trim() ? validAmount : null },
    { label: copy.checks.funds, ok: affords },
  ];

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <Card padding="lg" className="grid gap-6">
        <FormField label={copy.amount} error={error} hint={copy.amountHint}>
          {(control) => (
            <Input
              {...control}
              inputMode="decimal"
              autoComplete="off"
              placeholder={copy.amountPlaceholder}
              suffix={tokenSymbol()}
              value={amountText}
              disabled={!allowed || !payer}
              onChange={(event) => setAmountText(event.target.value)}
            />
          )}
        </FormField>

        <div className="grid gap-3 rounded-control bg-mist px-4 py-3 text-sm">
          <p className="flex items-baseline justify-between gap-4">
            <span className="text-ink-soft">{copy.yourBalance}</span>
            <span className="font-semibold text-ink tabular-nums">
              {!payer
                ? "—"
                : held.isPending
                  ? "…"
                  : held.data !== undefined
                    ? formatTokenAmount(held.data)
                    : copy.balanceUnknown}
            </span>
          </p>
          {validAmount && (
            <p className="flex items-baseline justify-between gap-4">
              <span className="text-ink-soft">{copy.afterwards}</span>
              <span className="font-semibold text-ink tabular-nums">{formatTokenAmount(balance + amount)}</span>
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-pretty text-ink-soft">{copy.keepSome}</p>
        <p className="text-sm leading-relaxed text-pretty text-ink-soft">{copy.irreversible}</p>

        {feedback && feedback.status !== "success" && <TxFeedback state={feedback} />}

        <Button
          type="submit"
          size="lg"
          disabled={!allowed || !payer || deposit.isPending}
          className="w-full sm:w-auto sm:justify-self-end"
        >
          <Coins className="size-4" aria-hidden="true" />
          {copy.submit}
        </Button>
      </Card>

      <Card padding="md" className="lg:sticky lg:top-10">
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{copy.checksTitle}</p>
        <ul className="mt-4 grid gap-3">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-3 text-sm">
              <span
                aria-hidden="true"
                className={classNames(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                  check.ok === true && "bg-royal text-on-royal",
                  check.ok === false && "bg-coral text-on-coral",
                  check.ok === null && "bg-mist ring-1 ring-hairline-strong",
                )}
              >
                {check.ok === true && <Check className="size-3" strokeWidth={3.5} />}
                {check.ok === false && <X className="size-3" strokeWidth={3.5} />}
              </span>
              <span className={check.ok === false ? "font-medium text-wine" : "text-ink-soft"}>{check.label}</span>
            </li>
          ))}
        </ul>
      </Card>
    </form>
  );
}

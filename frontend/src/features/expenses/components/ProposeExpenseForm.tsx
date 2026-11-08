"use client";

import { ArrowRight, Check, CircleCheck, Send, X } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button, buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FileDrop } from "@/components/molecules/FileDrop";
import { FormField } from "@/components/molecules/FormField";
import { TxFeedback } from "@/components/molecules/TxFeedback";
import { appCopy } from "@/copy/app.es";
import { describeAnyError } from "@/copy/errors.es";
import { shortenAddress } from "@/lib/format/address";
import { AmountFormatError, parseAmount } from "@/lib/format/amount";
import { categoryLabel } from "@/lib/format/category";
import { formatTokenAmount, tokenDecimals, tokenSymbol } from "@/lib/format/token";
import { hashFile, toHex } from "@/lib/hash/sha256";
import { validateInvoice } from "@/lib/treasury/input";
import { classNames } from "@/lib/ui/class-names";
import { toasts } from "@/lib/ui/toast-store";
import { txFeedbackFor } from "@/lib/ui/tx-feedback";

import { useExpenseActions } from "../hooks/use-expense-actions";

type ProposeExpenseFormProps = {
  budgets: ReadonlyArray<{ category: string; remaining: bigint }>;
  vendors: readonly string[];
  expenseHref: (id: number) => string;
};

type Errors = Partial<Record<"category" | "vendor" | "amount" | "invoice", string>>;

const ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";

function readAmount(text: string): bigint | null {
  try {
    return parseAmount(text, tokenDecimals());
  } catch (error) {
    if (error instanceof AmountFormatError) return null;
    throw error;
  }
}

/**
 * Proposes an expense: category, approved vendor, amount and invoice. The browser computes the
 * invoice's fingerprint, and a live checklist shows the rules the contract will apply, so a proposal
 * that would be rejected is caught before anyone is asked to sign.
 */
export function ProposeExpenseForm({ budgets, vendors, expenseHref }: ProposeExpenseFormProps) {
  const { propose: copy, tx } = appCopy;
  const { propose } = useExpenseActions();

  const [category, setCategory] = useState("");
  const [vendor, setVendor] = useState("");
  const [amountText, setAmountText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const line = budgets.find((budget) => budget.category === category);
  const amount = readAmount(amountText);
  const fits = line && amount !== null && amount > 0n ? amount <= line.remaining : null;

  async function chooseFile(chosen: File) {
    setFile(chosen);
    setFingerprint(null);
    setErrors((current) => ({ ...current, invoice: undefined }));
    try {
      validateInvoice(chosen);
      setFingerprint(toHex(await hashFile(chosen)));
    } catch (error) {
      setErrors((current) => ({ ...current, invoice: describeAnyError(error) }));
    }
  }

  function validate(): Errors {
    const found: Errors = {};
    if (!category) found.category = copy.categoryPlaceholder;
    if (!vendor) found.vendor = copy.vendorPlaceholder;
    if (amount === null || amount <= 0n) found.amount = copy.amountHint;
    else if (fits === false) found.amount = copy.overBudget;
    if (!file) found.invoice = copy.invoicePrompt;
    return found;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !file || amount === null) return;

    const receipt = await propose.mutateAsync({ category, vendor, amount, invoice: file }).catch(() => null);
    if (!receipt) return;
    toasts.show({
      tone: "success",
      title: copy.proposed(receipt.value),
      action: { label: tx.explorer, href: receipt.explorerUrl },
    });
  }

  function reset() {
    propose.reset();
    setCategory("");
    setVendor("");
    setAmountText("");
    setFile(null);
    setFingerprint(null);
    setErrors({});
  }

  if (propose.isSuccess && propose.data) {
    const id = propose.data.value;
    return (
      <Card padding="lg" className="mx-auto max-w-xl text-center">
        <span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-royal text-on-royal">
          <CircleCheck className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{copy.proposed(id)}</h2>
        <div className="mt-5 text-left">
          <TxFeedback
            state={{
              status: "success",
              message: copy.proposedBody,
              link: { label: tx.explorer, href: propose.data.explorerUrl },
            }}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={expenseHref(id)} className={buttonStyles({ size: "lg", shape: "pill" })}>
            {copy.viewExpense}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Button variant="soft" size="lg" shape="pill" onClick={reset}>
            {copy.another}
          </Button>
        </div>
      </Card>
    );
  }

  const feedback = txFeedbackFor(propose, {
    pending: tx.pending,
    success: copy.submit,
    explorerLabel: tx.explorer,
    describe: describeAnyError,
  });

  const checks = [
    { label: copy.checks.vendor, ok: vendor ? true : null },
    { label: copy.checks.budget, ok: fits },
    { label: copy.checks.invoice, ok: fingerprint ? true : null },
  ];

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <Card padding="lg" className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            label={copy.category}
            error={errors.category}
            aside={line ? copy.available(formatTokenAmount(line.remaining)) : undefined}
          >
            {(control) => (
              <Select {...control} value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">{copy.categoryPlaceholder}</option>
                {budgets.map((budget) => (
                  <option key={budget.category} value={budget.category}>
                    {categoryLabel(budget.category)}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField label={copy.amount} error={errors.amount} hint={copy.amountHint}>
            {(control) => (
              <Input
                {...control}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                suffix={tokenSymbol()}
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
              />
            )}
          </FormField>
        </div>

        <FormField label={copy.vendor} error={errors.vendor} hint={vendors.length === 0 ? copy.vendorNone : undefined}>
          {(control) => (
            <Select
              {...control}
              value={vendor}
              disabled={vendors.length === 0}
              onChange={(event) => setVendor(event.target.value)}
            >
              <option value="">{copy.vendorPlaceholder}</option>
              {vendors.map((address) => (
                <option key={address} value={address}>
                  {shortenAddress(address, 6, 6)}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label={copy.invoice} error={errors.invoice}>
          {(control) => (
            <FileDrop
              id={control.id}
              aria-describedby={control["aria-describedby"]}
              invalid={Boolean(errors.invoice)}
              accept={ACCEPT}
              file={file}
              onFile={(chosen) => void chooseFile(chosen)}
              labels={{ prompt: copy.invoicePrompt, hint: copy.invoiceHint, replace: copy.invoiceReplace }}
              detail={
                <span className="max-w-full truncate font-mono text-xs text-ink-faint">
                  {fingerprint ? `${copy.fingerprint} ${fingerprint.slice(0, 16)}…${fingerprint.slice(-8)}` : copy.hashing}
                </span>
              }
            />
          )}
        </FormField>

        {feedback && feedback.status !== "success" && <TxFeedback state={feedback} />}

        <Button type="submit" size="lg" disabled={propose.isPending} className="w-full sm:w-auto sm:justify-self-end">
          <Send className="size-4" aria-hidden="true" />
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
        {line && (
          <div className="mt-5 rounded-control bg-mist px-4 py-3">
            <p className="text-sm text-ink-soft">{categoryLabel(line.category)}</p>
            <p className="mt-0.5 text-lg font-semibold text-ink tabular-nums">{formatTokenAmount(line.remaining)}</p>
            <p className="text-xs text-ink-faint">{copy.remainingLabel}</p>
          </div>
        )}
      </Card>
    </form>
  );
}

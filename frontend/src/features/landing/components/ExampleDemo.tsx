"use client";

import { ArrowRight, Building2, Check, FileText, Landmark, RotateCcw, ScrollText, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { landingCopy } from "@/copy/landing.es";
import { classNames } from "@/lib/ui/class-names";

import {
  DEMO_AMOUNTS,
  DEMO_STEPS,
  formatPesos,
  nextStep,
  stepNumber,
  viewOf,
  type DemoStep,
  type LedgerEntry,
} from "../demo/demo-flow";

const { example } = landingCopy;

function ledgerText(entry: LedgerEntry): string {
  switch (entry.kind) {
    case "proposed":
      return example.ledger.proposed;
    case "approved":
      return `${example.ledger.approvedBy} ${example.council[entry.signer]}`;
    case "paid":
      return example.ledger.paid;
    case "rejected":
      return example.ledger.rejected;
  }
}

function PanelTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <span className="text-royal">{icon}</span>
      {children}
    </p>
  );
}

/** The budget bar. Its fill is a scaled element, so it moves smoothly without relayout. */
function BudgetBar({ spent, attempted }: { spent: number; attempted: boolean }) {
  const spentShare = spent / DEMO_AMOUNTS.budget;
  const attemptShare = Math.min(DEMO_AMOUNTS.secondExpense / DEMO_AMOUNTS.budget, 1 - spentShare);

  return (
    <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-periwinkle-soft" aria-hidden="true">
      <div
        className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-lavender to-royal transition-transform duration-500"
        style={{ transform: `scaleX(${spentShare})` }}
      />
      {attempted && (
        <div
          className="absolute inset-y-0 animate-pop rounded-full bg-coral/60"
          style={{ left: `${spentShare * 100}%`, width: `${attemptShare * 100}%` }}
        />
      )}
    </div>
  );
}

function CouncilAvatars({ approvals }: { approvals: number }) {
  return (
    <ul className="flex items-center gap-2" aria-label={example.councilLabel}>
      {example.council.map((name, index) => {
        const signed = index < approvals;
        return (
          <li key={name} className="flex flex-col items-center gap-1">
            <span
              className={classNames(
                "relative flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300",
                signed ? "bg-royal text-on-royal" : "bg-mist text-ink-soft ring-1 ring-hairline-strong",
              )}
            >
              {name[0]}
              {signed && (
                <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-periwinkle text-ink ring-2 ring-cloud">
                  <Check className="size-2.5" strokeWidth={3.5} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="text-xs text-ink-faint">{name}</span>
            <span className="sr-only">{signed ? example.councilSigned : example.councilPending}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A short, clickable walk-through of one expense: proposed, signed twice and paid, then a second
 * one that the budget rule rejects. Illustrative only; the real flow runs on Stellar testnet.
 */
export function ExampleDemo() {
  const [step, setStep] = useState<DemoStep>("idle");
  const view = viewOf(step);
  const text = example.steps[step];
  const last = step === DEMO_STEPS[DEMO_STEPS.length - 1];

  return (
    <Card padding="lg" className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <Building2 className="size-5 text-royal" aria-hidden="true" />
          {example.building}
        </p>
        <div className="flex items-center gap-3">
          <ol className="flex items-center gap-1.5" aria-hidden="true">
            {DEMO_STEPS.map((candidate) => (
              <li
                key={candidate}
                className={classNames(
                  "h-1.5 rounded-full transition-all duration-300",
                  stepNumber(candidate) <= stepNumber(step) ? "w-6 bg-royal" : "w-3 bg-periwinkle-soft",
                )}
              />
            ))}
          </ol>
          <span className="text-sm font-semibold text-ink-soft">
            {example.progress} {stepNumber(step)}/{DEMO_STEPS.length}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:min-h-[26rem] lg:grid-cols-3">
        <div className="rounded-card bg-mist p-5">
          <PanelTitle icon={<Landmark className="size-4" aria-hidden="true" />}>{example.accountTitle}</PanelTitle>
          <p className="mt-3 text-sm text-ink-faint">{example.balanceLabel}</p>
          <p className="text-3xl font-semibold tracking-tight text-royal tabular-nums">{formatPesos(view.balance)}</p>

          <div className="mt-6 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-semibold text-ink">{example.budgetLabel}</span>
            <span className="text-ink-soft tabular-nums">
              {formatPesos(view.spent)} {example.budgetOf} {formatPesos(DEMO_AMOUNTS.budget)}
            </span>
          </div>
          <BudgetBar spent={view.spent} attempted={view.secondExpense === "rejected"} />
          <p className="mt-2 text-sm text-ink-soft">
            {example.remainingLabel}: <span className="font-semibold tabular-nums">{formatPesos(view.remaining)}</span>
          </p>
        </div>

        <div className="rounded-card bg-mist p-5">
          <PanelTitle icon={<FileText className="size-4" aria-hidden="true" />}>{example.expenseTitle}</PanelTitle>
          {view.firstExpense === "none" ? (
            <p className="mt-4 text-sm text-ink-faint">{example.expenseEmpty}</p>
          ) : (
            <div key={view.firstExpense} className="mt-4 animate-pop">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{example.expenseVendor}</p>
                  <p className="text-xl font-semibold text-royal tabular-nums">
                    {formatPesos(DEMO_AMOUNTS.firstExpense)}
                  </p>
                </div>
                <Badge tone={view.firstExpense === "paid" ? "royal" : "neutral"}>
                  {view.firstExpense === "paid" ? (
                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                  ) : null}
                  {view.firstExpense === "paid" ? example.status.paid : example.status.pending}
                </Badge>
              </div>
              <div className="mt-5">
                <CouncilAvatars approvals={view.approvals} />
              </div>
            </div>
          )}

          {view.secondExpense === "rejected" && (
            <div role="alert" className="mt-5 animate-pop rounded-control bg-coral-soft p-4">
              <p className="flex items-center gap-2 font-semibold text-wine">
                <X className="size-4" strokeWidth={3} aria-hidden="true" />
                {formatPesos(DEMO_AMOUNTS.secondExpense)} · {example.status.rejected}
              </p>
              <p className="mt-1 text-sm font-semibold text-wine">{example.reject.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{example.reject.body}</p>
            </div>
          )}
        </div>

        <div className="rounded-card bg-mist p-5">
          <PanelTitle icon={<ScrollText className="size-4" aria-hidden="true" />}>{example.ledgerTitle}</PanelTitle>
          {view.ledger.length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">{example.ledgerEmpty}</p>
          ) : (
            <ul className="mt-4 grid gap-2.5">
              {view.ledger.map((entry, index) => (
                <li
                  key={`${entry.kind}-${index}`}
                  className={classNames(
                    "flex animate-pop items-start gap-2.5 rounded-control px-3 py-2 text-sm",
                    entry.kind === "rejected" ? "bg-coral-soft text-wine" : "bg-cloud text-ink-soft",
                  )}
                >
                  <span
                    className={classNames(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                      entry.kind === "rejected" ? "bg-coral text-on-coral" : "bg-royal text-on-royal",
                    )}
                    aria-hidden="true"
                  >
                    {entry.kind === "rejected" ? (
                      <X className="size-2.5" strokeWidth={4} />
                    ) : (
                      <Check className="size-2.5" strokeWidth={4} />
                    )}
                  </span>
                  {ledgerText(entry)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p key={step} aria-live="polite" className="max-w-2xl animate-pop text-pretty leading-relaxed text-ink-soft sm:min-h-[4.5rem]">
          {text.caption}
        </p>
        <Button size="lg" shape="pill" onClick={() => setStep(nextStep(step))} className="shrink-0">
          {last ? (
            <RotateCcw className="size-5" aria-hidden="true" />
          ) : null}
          {text.action}
          {last ? null : <ArrowRight className="size-5" aria-hidden="true" />}
        </Button>
      </div>
    </Card>
  );
}

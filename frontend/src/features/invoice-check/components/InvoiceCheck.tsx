"use client";

import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonStyles } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FileDrop } from "@/components/molecules/FileDrop";
import { appCopy } from "@/copy/app.es";
import { hashFile, toHex } from "@/lib/hash/sha256";

import { matchInvoice, type InvoiceCandidate } from "../services/match-invoice";

type InvoiceCheckProps = {
  /** The expenses the file may belong to, with a title to name each match. */
  candidates: ReadonlyArray<InvoiceCandidate & { title: string }>;
  /** Link to an expense, to open a match. */
  hrefFor?: (id: number) => string;
  /** When checking against one expense only, say so in the result. */
  single?: boolean;
};

type Result = { fingerprint: string; matches: number[] };

/**
 * Drop an invoice and see whether it is the one an expense was proposed with. The fingerprint is
 * computed in the browser; the file never leaves it.
 */
export function InvoiceCheck({ candidates, hrefFor, single = false }: InvoiceCheckProps) {
  const { verify: copy } = appCopy;
  const [file, setFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function check(chosen: File) {
    setFile(chosen);
    setResult(null);
    setChecking(true);
    try {
      const fingerprint = toHex(await hashFile(chosen));
      setResult({ fingerprint, matches: matchInvoice(fingerprint, candidates) });
    } finally {
      setChecking(false);
    }
  }

  const titleOf = (id: number) => candidates.find((candidate) => candidate.id === id)?.title ?? `#${id}`;

  return (
    <div className="grid gap-4">
      <FileDrop
        file={file}
        onFile={(chosen) => void check(chosen)}
        labels={{ prompt: copy.prompt, hint: copy.hint, replace: copy.replace }}
      />

      {checking && (
        <p role="status" className="flex items-center gap-2 text-sm text-ink-soft">
          <Spinner className="size-4 text-royal" />
          {copy.checking}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={
            result.matches.length > 0
              ? "animate-pop rounded-card bg-royal-soft p-5"
              : "animate-pop rounded-card bg-coral-soft p-5"
          }
        >
          <div className="flex items-start gap-3">
            {result.matches.length > 0 ? (
              <CircleCheck className="mt-0.5 size-6 shrink-0 text-royal" aria-hidden="true" />
            ) : (
              <CircleX className="mt-0.5 size-6 shrink-0 text-wine" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={result.matches.length > 0 ? "font-semibold text-royal" : "font-semibold text-wine"}>
                {result.matches.length > 0
                  ? single
                    ? copy.matchExpected
                    : copy.match(titleOf(result.matches[0]))
                  : single
                    ? copy.noMatchExpected
                    : copy.noMatch}
              </p>
              {result.matches.length === 0 && <p className="mt-1 text-sm text-ink-soft">{copy.noMatchBody}</p>}
              <p className="mt-3 font-mono text-xs break-all text-ink-faint">
                {copy.yourFingerprint}: {result.fingerprint}
              </p>
              {!single && hrefFor && result.matches.length > 0 && (
                <Link
                  href={hrefFor(result.matches[0])}
                  className={buttonStyles({ variant: "soft", className: "mt-4" })}
                >
                  {copy.open}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";

import { Spinner } from "@/components/atoms/Spinner";
import { FileDrop } from "@/components/molecules/FileDrop";
import { appCopy } from "@/copy/app.es";
import { hashFile, toHex } from "@/lib/hash/sha256";

type InvoiceCheckProps = {
  /** The invoice fingerprint the expense was proposed with, in hexadecimal. */
  expectedHash: string;
};

/**
 * Drop an invoice and see whether it is the one the expense was proposed with. The fingerprint is
 * computed in the browser; the file never leaves it.
 */
export function InvoiceCheck({ expectedHash }: InvoiceCheckProps) {
  const { verify: copy } = appCopy;
  const [file, setFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ fingerprint: string; matches: boolean } | null>(null);

  async function check(chosen: File) {
    setFile(chosen);
    setResult(null);
    setChecking(true);
    try {
      const fingerprint = toHex(await hashFile(chosen));
      setResult({ fingerprint, matches: fingerprint === expectedHash.toLowerCase() });
    } finally {
      setChecking(false);
    }
  }

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
          className={result.matches ? "animate-pop rounded-card bg-royal-soft p-5" : "animate-pop rounded-card bg-coral-soft p-5"}
        >
          <div className="flex items-start gap-3">
            {result.matches ? (
              <CircleCheck className="mt-0.5 size-6 shrink-0 text-royal" aria-hidden="true" />
            ) : (
              <CircleX className="mt-0.5 size-6 shrink-0 text-wine" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={result.matches ? "font-semibold text-royal" : "font-semibold text-wine"}>
                {result.matches ? copy.matchExpected : copy.noMatchExpected}
              </p>
              {!result.matches && <p className="mt-1 text-sm text-ink-soft">{copy.noMatchBody}</p>}
              <p className="mt-3 font-mono text-xs break-all text-ink-faint">
                {copy.yourFingerprint}: {result.fingerprint}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

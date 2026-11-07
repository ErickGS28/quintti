"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/atoms/Avatar";
import { shortenAddress } from "@/lib/format/address";
import { classNames } from "@/lib/ui/class-names";

export type AddressTagLabels = { copy: string; copied: string; explorer: string };

type AddressTagProps = {
  address: string;
  /** A human name for the address, when one is known. */
  name?: string | null;
  /** A short role after the address, for example "Consejo". */
  role?: string;
  /** Link to the account in the block explorer. */
  explorerUrl?: string;
  labels: AddressTagLabels;
  size?: "sm" | "md";
};

/**
 * An address people can recognize: a colored avatar, a name when known, the shortened address in
 * monospace, and buttons to copy it or open it in the explorer.
 */
export function AddressTag({ address, name, role, explorerUrl, labels, size = "md" }: AddressTagProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // The clipboard can be blocked; the address stays visible and selectable.
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar address={address} className={size === "sm" ? "size-8" : "size-10"} />
      <div className="min-w-0 flex-1">
        {name && <p className="truncate text-sm font-semibold text-ink">{name}</p>}
        <p
          className={classNames("truncate font-mono", name ? "text-xs text-ink-faint" : "text-sm font-medium text-ink")}
          title={address}
        >
          {shortenAddress(address, 5, 5)}
          {role && <span className="font-sans text-ink-faint"> · {role}</span>}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? labels.copied : labels.copy}
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-royal-soft hover:text-royal"
        >
          {copied ? (
            <Check className="size-4 text-royal" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
        </button>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={labels.explorer}
            className="inline-flex size-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-royal-soft hover:text-royal"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

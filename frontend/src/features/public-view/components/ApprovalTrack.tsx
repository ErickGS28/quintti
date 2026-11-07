import { Check } from "lucide-react";

import { Avatar } from "@/components/atoms/Avatar";
import { ProgressBar } from "@/components/atoms/ProgressBar";
import { appCopy } from "@/copy/app.es";
import { shortenAddress } from "@/lib/format/address";
import { approvalProgress } from "@/lib/treasury/approvals";
import { classNames } from "@/lib/ui/class-names";

type ApprovalTrackProps = {
  approvals: readonly string[];
  council: readonly string[];
  threshold: number;
  /** A human name for an address, when one is known. */
  nameFor?: (address: string) => string | null;
};

/**
 * Who on the council signed an expense and how many signatures are still missing, counted the way
 * the contract counts them. Signatures from people who left the council are listed apart.
 */
export function ApprovalTrack({ approvals, council, threshold, nameFor }: ApprovalTrackProps) {
  const { detail, expenses } = appCopy;
  const progress = approvalProgress(approvals, council, threshold);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
          {expenses.signatures(progress.valid, progress.needed)}
        </p>
      </div>
      <ProgressBar value={progress.needed ? progress.valid / progress.needed : 0} className="mt-3" />
      <p className="mt-2 text-sm text-ink-soft">{detail.approvalsHint(progress.missing)}</p>

      <ul className="mt-5 grid gap-3">
        {council.map((member) => {
          const signed = approvals.includes(member);
          const name = nameFor?.(member);
          return (
            <li key={member} className="flex items-center gap-3">
              <span className="relative">
                <Avatar address={member} className="size-9" />
                {signed && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full bg-royal text-on-royal ring-2 ring-cloud"
                  >
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{name || shortenAddress(member, 5, 5)}</p>
                {name && <p className="truncate font-mono text-xs text-ink-faint">{shortenAddress(member, 5, 5)}</p>}
              </div>
              <span
                className={classNames(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  signed ? "bg-royal-soft text-royal" : "bg-mist text-ink-faint",
                )}
              >
                {signed ? detail.signed : detail.notSigned}
              </span>
            </li>
          );
        })}
      </ul>

      {progress.stale.length > 0 && (
        <div className="mt-5 rounded-control bg-mist px-4 py-3 text-sm text-ink-soft">
          <p>{detail.stale}</p>
          <ul className="mt-1 font-mono text-xs">
            {progress.stale.map((address) => (
              <li key={address}>{shortenAddress(address, 5, 5)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

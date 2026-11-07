import { FileText, Wrench } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { landingCopy } from "@/copy/landing.es";

const { proposal } = landingCopy.figures;
const { status } = landingCopy.example;

/** Step 2: an expense proposed to an approved vendor, with its invoice fingerprint. */
export function ProposalFigure() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col justify-center gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-royal-soft text-royal">
          <Wrench className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{proposal.vendor}</p>
          <p className="text-sm text-ink-faint">$8.000.000</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-control bg-mist px-3 py-2.5">
        <FileText className="size-4 shrink-0 text-royal" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-ink">{proposal.invoice}</p>
          <p className="truncate font-mono text-ink-faint">{proposal.fingerprint}</p>
        </div>
      </div>
      <Badge tone="neutral" className="w-fit">
        {status.pending}
      </Badge>
    </div>
  );
}

import { Check, ExternalLink } from "lucide-react";

import { Ripple } from "@/components/atoms/Ripple";
import { landingCopy } from "@/copy/landing.es";

const { receipt } = landingCopy.figures;

/** Step 4: the payment is done and anyone can open its public receipt. */
export function ReceiptFigure() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative flex size-16 items-center justify-center">
        <Ripple tone="lavender" rings={3} />
        <span className="relative flex size-11 items-center justify-center rounded-full bg-royal text-on-royal">
          <Check className="size-6" strokeWidth={3} />
        </span>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-royal">{receipt.title}</p>
        <p className="text-sm text-ink-faint">{receipt.detail}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-royal-soft px-3 py-1 text-sm font-semibold text-royal">
        {receipt.link}
        <ExternalLink className="size-3" />
      </span>
    </div>
  );
}

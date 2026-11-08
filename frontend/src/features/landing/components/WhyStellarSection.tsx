import { Check, Eye, Landmark, Timer, X } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { landingCopy } from "@/copy/landing.es";
import { classNames } from "@/lib/ui/class-names";

const { why } = landingCopy;
const [, webHeader, stellarHeader] = why.compare.headers;

const ICONS: ReactNode[] = [
  <Landmark key="rules" className="size-6" aria-hidden="true" />,
  <Eye key="ledger" className="size-6" aria-hidden="true" />,
  <Timer key="speed" className="size-6" aria-hidden="true" />,
];

/**
 * Why this needs Stellar and not a normal app, in two screens: a side-by-side comparison, then the
 * three reasons.
 */
export function WhyStellarSection() {
  return (
    <>
      <Chapter id={why.id} tone="lilac">
        <ScreenHeading eyebrow={why.eyebrow} title={why.title} lead={why.lead} compact />

        <div className="mt-[clamp(1.25rem,4vh,2.5rem)]">
          <div aria-hidden="true" className="hidden grid-cols-[1fr_1fr_1.2fr] gap-4 px-6 pb-3 md:grid">
            <span />
            <span className="text-base font-bold text-ink-faint">{webHeader}</span>
            <span className="text-base font-bold text-royal">{stellarHeader}</span>
          </div>
          <ul className="grid gap-2.5">
            {why.compare.rows.map((row, index) => (
              <li key={row.question} className={classNames("reveal", index === why.compare.rows.length - 1 && "short:hidden")}>
                <Card padding="none" className="grid gap-2 px-5 py-[clamp(0.5rem,1.4vh,0.875rem)] md:grid-cols-[1fr_1fr_1.2fr] md:items-center md:gap-4 md:px-6">
                  <h3 className="text-base font-bold tracking-tight">{row.question}</h3>
                  <p className="flex items-start gap-2.5 text-[0.9375rem]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-coral-soft text-wine">
                      <X className="size-3" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-xs font-bold text-ink-faint md:sr-only">{webHeader}</span>
                      {row.web2}
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5 text-[0.9375rem] font-semibold text-ink">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-royal text-on-royal">
                      <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-xs font-bold text-royal md:sr-only">{stellarHeader}</span>
                      {row.stellar}
                    </span>
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Chapter>

      <Chapter tone="lilac">
        <ScreenHeading eyebrow={why.itemsEyebrow} title={why.itemsTitle} />
        <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 md:grid-cols-3">
          {why.items.map((item, index) => (
            <li key={item.title} className="reveal">
              <Card padding="lg" spotlight className="h-full">
                <span className="flex size-12 items-center justify-center rounded-full bg-royal-soft text-royal">
                  {ICONS[index]}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Chapter>
    </>
  );
}

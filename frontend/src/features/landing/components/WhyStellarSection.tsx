import { Check, Eye, Info, Landmark, Timer, X } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { landingCopy } from "@/copy/landing.es";

const { why } = landingCopy;
const [, webHeader, stellarHeader] = why.compare.headers;

const ICONS: ReactNode[] = [
  <Landmark key="rules" className="size-6" aria-hidden="true" />,
  <Eye key="ledger" className="size-6" aria-hidden="true" />,
  <Timer key="speed" className="size-6" aria-hidden="true" />,
];

/**
 * Why this needs Stellar and not a normal app: a side-by-side comparison, three reasons, and an
 * honest note about what the network does not solve.
 */
export function WhyStellarSection() {
  return (
    <section id={why.id} className="scroll-mt-28">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow={why.eyebrow} title={why.title} description={why.body} />

        <div className="mt-14">
          <div aria-hidden="true" className="hidden grid-cols-[1.1fr_1fr_1fr] gap-4 px-6 pb-3 md:grid">
            <span />
            <span className="text-sm font-semibold text-ink-soft">{webHeader}</span>
            <span className="text-sm font-semibold text-royal">{stellarHeader}</span>
          </div>
          <ul className="grid gap-4">
            {why.compare.rows.map((row) => (
              <li key={row.question}>
                <Card padding="md" className="grid gap-4 md:grid-cols-[1.1fr_1fr_1fr] md:items-center md:gap-4">
                  <h3 className="text-base font-semibold tracking-tight">{row.question}</h3>
                  <p className="flex items-start gap-2.5 text-ink-soft">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-coral-soft text-wine">
                      <X className="size-3" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-xs font-semibold text-ink-faint md:sr-only">{webHeader}</span>
                      {row.web2}
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5 font-medium text-ink">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-royal text-on-royal">
                      <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-xs font-semibold text-royal md:sr-only">{stellarHeader}</span>
                      {row.stellar}
                    </span>
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-16 grid gap-10 md:grid-cols-3">
          {why.items.map((item, index) => (
            <li key={item.title}>
              <span className="flex size-12 items-center justify-center rounded-full bg-royal-soft text-royal">
                {ICONS[index]}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex gap-4 rounded-card bg-mist p-6 sm:p-8">
          <Info className="mt-1 size-6 shrink-0 text-wine" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-wine">{why.honest.title}</h3>
            <p className="mt-2 max-w-3xl text-pretty leading-relaxed text-ink-soft">{why.honest.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

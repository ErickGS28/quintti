import { Check, Eye, Info, Landmark, Timer, X } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { Slide } from "@/components/molecules/Slide";
import { TitleSlide } from "@/components/molecules/TitleSlide";
import { landingCopy } from "@/copy/landing.es";

const { why } = landingCopy;
const [, webHeader, stellarHeader] = why.compare.headers;

const ICONS: ReactNode[] = [
  <Landmark key="rules" className="size-8" aria-hidden="true" />,
  <Eye key="ledger" className="size-8" aria-hidden="true" />,
  <Timer key="speed" className="size-8" aria-hidden="true" />,
];

/**
 * Why this needs Stellar and not a normal app: a side-by-side comparison, three reasons, and an
 * honest note about what the network does not solve.
 */
export function WhyStellarSection() {
  return (
    <Chapter id={why.id} tone="periwinkle">
      <TitleSlide index="04" title={why.eyebrow} lead={why.title} />

      <Slide>
        <p className="reveal mx-auto max-w-3xl text-center text-[length:clamp(1.25rem,2.2vw,1.875rem)] leading-relaxed text-pretty">
          {why.body}
        </p>

        <div className="mt-14">
          <div aria-hidden="true" className="hidden grid-cols-[1.1fr_1fr_1fr] gap-5 px-8 pb-4 md:grid">
            <span />
            <span className="text-xl font-bold text-wine">{webHeader}</span>
            <span className="text-xl font-bold text-royal">{stellarHeader}</span>
          </div>
          <ul className="grid gap-4">
            {why.compare.rows.map((row) => (
              <li key={row.question} className="reveal">
                <Card padding="md" spotlight className="grid gap-4 sm:p-8 md:grid-cols-[1.1fr_1fr_1fr] md:items-center md:gap-5">
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{row.question}</h3>
                  <p className="flex items-start gap-3 text-lg">
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-coral text-on-coral">
                      <X className="size-3.5" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-sm font-bold text-wine md:sr-only">{webHeader}</span>
                      {row.web2}
                    </span>
                  </p>
                  <p className="flex items-start gap-3 text-lg font-semibold text-ink">
                    <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-royal text-on-royal">
                      <Check className="size-3.5" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="mb-0.5 block text-sm font-bold text-royal md:sr-only">{stellarHeader}</span>
                      {row.stellar}
                    </span>
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Slide>

      <Slide>
        <ul className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {why.items.map((item, index) => (
            <li key={item.title} className="reveal">
              <Card surface="frost" padding="lg" spotlight className="h-full sm:p-9">
                <span className="flex size-16 items-center justify-center rounded-full bg-royal text-on-royal">
                  {ICONS[index]}
                </span>
                <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-pretty sm:text-xl">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="reveal mt-10 flex gap-5 rounded-card bg-wine p-7 text-wine-soft shadow-float sm:p-10">
          <Info className="mt-1 size-8 shrink-0 text-coral-soft" aria-hidden="true" />
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-on-royal">{why.honest.title}</h3>
            <p className="mt-3 max-w-4xl text-lg leading-relaxed text-pretty sm:text-xl">{why.honest.body}</p>
          </div>
        </div>
      </Slide>
    </Chapter>
  );
}

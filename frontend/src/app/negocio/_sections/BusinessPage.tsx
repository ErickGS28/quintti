import { Sparkles } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { PageWash } from "@/components/atoms/PageWash";
import { Chapter } from "@/components/molecules/Chapter";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { SlideRail } from "@/components/organisms/SlideRail";
import { SpotlightTracker } from "@/components/organisms/SpotlightTracker";
import { negocioCopy } from "@/copy/negocio.es";

const { nav, income, plan } = negocioCopy;

/** The screens on the page. */
const LINKS = [
  { id: income.id, label: nav.income },
  { id: plan.id, label: nav.plan },
];

/**
 * The business model and the plan after the hackathon, in the landing's style: where the income
 * comes from and the steps ahead. For now it is cut to these two screens so the recorded
 * walkthrough stays short. The other two ("Modelo": what a building moves against what it pays, and
 * "Seguimiento": what is done first and how it is measured) are in git history (commit 44237e0) and
 * their copy is still in `copy/negocio.es.ts`. Shared by address, not linked from the landing. Static.
 */
export function BusinessPage() {
  return (
    <div data-snap-page className="relative isolate">
      <div aria-hidden="true" className="h-0 snap-start" />
      <PageWash />

      <SlideRail label={nav.rail} items={LINKS} />

      <main>
        <Chapter id={income.id} tone="lilac">
          <ScreenHeading eyebrow={income.eyebrow} title={income.title} compact />
          <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 md:grid-cols-3">
            {income.items.map((item) => (
              <li key={item.title} className="reveal">
                <Card padding="lg" spotlight className="h-full short:p-5">
                  <Badge tone="royal">{item.when}</Badge>
                  <h3 className="mt-4 text-xl font-bold tracking-tight short:mt-3">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-pretty short:leading-snug">{item.body}</p>
                </Card>
              </li>
            ))}
          </ul>
          <div className="reveal mt-4 flex items-start gap-4 rounded-card bg-royal px-6 py-5 text-on-royal short:py-3">
            <Sparkles className="mt-1 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold tracking-tight">{income.why.title}</p>
              <p className="mt-1 leading-snug text-pretty text-royal-soft">{income.why.body}</p>
            </div>
          </div>
        </Chapter>

        <Chapter id={plan.id} tone="mist">
          <ScreenHeading eyebrow={plan.eyebrow} title={plan.title} lead={plan.lead} />
          <ol className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plan.steps.map((step, index) => (
              <li key={step.title} className="reveal">
                <Card padding="md" spotlight className="h-full short:p-4 sm:p-6 sm:short:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-lavender to-royal font-bold text-on-royal">
                      {index + 1}
                    </span>
                    <Badge tone="neutral">{step.horizon}</Badge>
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight short:mt-3">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-pretty short:leading-snug">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Chapter>
      </main>
      <SpotlightTracker />
    </div>
  );
}

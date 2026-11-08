import { Check, Equal, ListChecks, Sparkles } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { PageWash } from "@/components/atoms/PageWash";
import { Chapter } from "@/components/molecules/Chapter";
import { FloatingNav } from "@/components/molecules/FloatingNav";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { SlideRail } from "@/components/organisms/SlideRail";
import { SpotlightTracker } from "@/components/organisms/SpotlightTracker";
import { negocioCopy } from "@/copy/negocio.es";

const { nav, model, income, plan, follow } = negocioCopy;

const LINKS = [
  { id: model.id, label: nav.model },
  { id: income.id, label: nav.income },
  { id: plan.id, label: nav.plan },
  { id: follow.id, label: nav.steps },
];

/** A money amount large, with its period ("al mes") smaller beside it, so it stays on one line. */
function Amount({ value }: { value: string }) {
  const [amount, ...period] = value.split(" ");
  return (
    <p className="mt-3 flex flex-wrap items-baseline justify-center gap-x-2 leading-none font-bold tracking-[-0.03em] text-slide-title">
      <span className="text-[length:clamp(2rem,min(4.6vw,7.5vh),3.5rem)]">{amount}</span>
      <span className="text-[length:clamp(1.0625rem,1.6vw,1.375rem)] font-semibold tracking-normal text-slide-text">
        {period.join(" ")}
      </span>
    </p>
  );
}

function Checklist({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 grid gap-2.5 short:mt-3 short:gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 leading-snug text-slide-text">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-royal-soft text-royal"
          >
            <Check className="size-3" strokeWidth={3.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The business model and the plan after the hackathon, in four screens like the landing: what a
 * building pays against what it moves, where the income comes from, the steps ahead and what we do
 * first. Shared by address, not linked from the landing. Static.
 */
export function BusinessPage() {
  return (
    <div data-snap-page className="relative isolate">
      <div aria-hidden="true" className="h-0 snap-start" />
      <PageWash />

      <FloatingNav label={nav.label} placement="top" width="fit">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-royal-soft hover:text-royal sm:px-5 sm:text-[0.9375rem]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </FloatingNav>
      <SlideRail label={nav.rail} items={LINKS} />

      <main>
        {/* The sticky menu takes room above the first screen; pull the screen up so it still fits the window. */}
        <div className="-mt-14">
          <Chapter id={model.id} tone="royal">
            <ScreenHeading eyebrow={model.eyebrow} title={model.title} lead={model.lead} />
            <div className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 md:grid-cols-[1fr_auto_1fr]">
              <Card surface="glass" padding="lg" spotlight className="reveal flex flex-col justify-center text-center short:p-5">
                <p className="text-sm font-semibold text-slide-muted">{model.moved.label}</p>
                <Amount value={model.moved.value} />
                <p className="mt-3 text-slide-text">{model.moved.detail}</p>
              </Card>

              <div className="reveal flex flex-col items-center gap-2">
                <span className="flex size-12 items-center justify-center rounded-full bg-coral text-on-coral short:size-10">
                  <Equal className="size-5" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-coral px-4 py-1.5 text-sm font-bold whitespace-nowrap text-on-coral">
                  {model.share}
                </span>
              </div>

              <Card surface="glass" padding="lg" spotlight className="reveal flex flex-col justify-center text-center short:p-5">
                <p className="text-sm font-semibold text-slide-muted">{model.price.label}</p>
                <Amount value={model.price.value} />
                <p className="mt-3 text-slide-text">{model.price.detail}</p>
              </Card>
            </div>
            <p className="reveal mt-6 text-center text-sm font-semibold text-slide-muted short:mt-4">{model.note}</p>
          </Chapter>
        </div>

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

        <Chapter id={follow.id} tone="royal">
          <ScreenHeading eyebrow={follow.eyebrow} title={follow.title} compact />
          <div className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 md:grid-cols-2">
            <Card surface="glass" padding="lg" spotlight className="reveal short:p-5">
              <p className="flex items-center gap-2 text-lg font-bold tracking-tight text-slide-title">
                <Sparkles className="size-5" aria-hidden="true" />
                {follow.first.title}
              </p>
              <Checklist items={follow.first.items} />
            </Card>
            <Card surface="glass" padding="lg" spotlight className="reveal short:p-5">
              <p className="flex items-center gap-2 text-lg font-bold tracking-tight text-slide-title">
                <ListChecks className="size-5" aria-hidden="true" />
                {follow.measure.title}
              </p>
              <Checklist items={follow.measure.items} />
            </Card>
          </div>
          <p className="reveal mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-pretty text-slide-text short:mt-4 short:text-base">
            {follow.today}
          </p>
        </Chapter>
      </main>
      <SpotlightTracker />
    </div>
  );
}

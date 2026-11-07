import { BadgeCheck, Gauge, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { Slide } from "@/components/molecules/Slide";
import { TitleSlide } from "@/components/molecules/TitleSlide";
import { landingCopy } from "@/copy/landing.es";

import { BudgetFigure } from "../figures/BudgetFigure";
import { CouncilFigure } from "../figures/CouncilFigure";
import { ProposalFigure } from "../figures/ProposalFigure";
import { ReceiptFigure } from "../figures/ReceiptFigure";

const { solution } = landingCopy;

const RULE_ICONS: ReactNode[] = [
  <Gauge key="limit" className="size-8" aria-hidden="true" />,
  <BadgeCheck key="vendors" className="size-8" aria-hidden="true" />,
  <UsersRound key="council" className="size-8" aria-hidden="true" />,
];

/** One accent per rule, so the three cards use the lighter colors of the palette. */
const RULE_ACCENTS = ["bg-lavender", "bg-periwinkle", "bg-coral"];

const FIGURES: ReactNode[] = [
  <BudgetFigure key="budget" />,
  <ProposalFigure key="proposal" />,
  <CouncilFigure key="council" />,
  <ReceiptFigure key="receipt" />,
];

/** What Quintti does: three rules the account enforces, then the four steps of an expense. */
export function SolutionSection() {
  return (
    <Chapter id={solution.id} tone="royal">
      <TitleSlide index="02" indexLabel={landingCopy.nav.chapter} title={solution.eyebrow} lead={solution.title} />

      <Slide>
        <p className="reveal mx-auto max-w-3xl text-center text-[length:clamp(1.25rem,2.2vw,1.875rem)] leading-relaxed text-pretty text-slide-text">
          {solution.body}
        </p>
        <ul className="mt-14 grid gap-5 md:grid-cols-3 lg:gap-6">
          {solution.rules.map((rule, index) => (
            <li key={rule.title} className="reveal">
              <Card padding="lg" spotlight className="h-full sm:p-9">
                <span className={`block h-1.5 w-14 rounded-full ${RULE_ACCENTS[index]}`} aria-hidden="true" />
                <span className="mt-7 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-lavender to-royal text-on-royal">
                  {RULE_ICONS[index]}
                </span>
                <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{rule.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-pretty sm:text-xl">{rule.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Slide>

      <Slide>
        <h3 className="reveal text-center text-[length:clamp(2.25rem,5.5vw,4.75rem)] leading-none font-bold tracking-tight text-balance">
          {solution.stepsTitle}
        </h3>
        <ol className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
          {solution.steps.map((step, index) => (
            <li key={step.title} className="reveal relative">
              {index < solution.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-7 left-16 hidden h-0.5 w-[calc(100%-2.5rem)] rounded-full bg-gradient-to-r from-periwinkle to-lavender/0 xl:block"
                />
              )}
              <span className="relative flex size-14 items-center justify-center rounded-full bg-coral text-2xl font-bold text-on-coral">
                {index + 1}
              </span>
              <Card padding="md" spotlight className="mt-5 h-52">
                {FIGURES[index]}
              </Card>
              <h4 className="mt-6 text-2xl font-bold tracking-tight">{step.title}</h4>
              <p className="mt-2 text-lg leading-relaxed text-pretty text-slide-text">{step.body}</p>
            </li>
          ))}
        </ol>
      </Slide>
    </Chapter>
  );
}

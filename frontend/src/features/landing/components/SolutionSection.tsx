import { BadgeCheck, Gauge, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { landingCopy } from "@/copy/landing.es";

import { BudgetFigure } from "../figures/BudgetFigure";
import { CouncilFigure } from "../figures/CouncilFigure";
import { ProposalFigure } from "../figures/ProposalFigure";
import { ReceiptFigure } from "../figures/ReceiptFigure";

const { solution } = landingCopy;

const RULE_ICONS: ReactNode[] = [
  <Gauge key="limit" className="size-6" aria-hidden="true" />,
  <BadgeCheck key="vendors" className="size-6" aria-hidden="true" />,
  <UsersRound key="council" className="size-6" aria-hidden="true" />,
];

const FIGURES: ReactNode[] = [
  <BudgetFigure key="budget" />,
  <ProposalFigure key="proposal" />,
  <CouncilFigure key="council" />,
  <ReceiptFigure key="receipt" />,
];

/** What Quintti does: three rules the account enforces, then the four steps of an expense. */
export function SolutionSection() {
  return (
    <section id={solution.id} className="scroll-mt-28">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow={solution.eyebrow} title={solution.title} description={solution.body} />

        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {solution.rules.map((rule, index) => (
            <li key={rule.title}>
              <Card className="h-full">
                <span className="flex size-12 items-center justify-center rounded-full bg-royal-soft text-royal">
                  {RULE_ICONS[index]}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{rule.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{rule.body}</p>
              </Card>
            </li>
          ))}
        </ul>

        <h3 className="mt-20 text-2xl font-semibold tracking-tight text-royal">{solution.stepsTitle}</h3>
        <ol className="mt-10 grid gap-10 lg:grid-cols-4 lg:gap-6">
          {solution.steps.map((step, index) => (
            <li key={step.title} className="relative pl-16 lg:pl-0">
              {index < solution.steps.length - 1 && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute top-12 -bottom-10 left-6 w-px bg-gradient-to-b from-lavender to-periwinkle lg:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-6 left-14 hidden h-px w-[calc(100%-2.5rem)] bg-gradient-to-r from-lavender to-periwinkle lg:block"
                  />
                </>
              )}
              <span className="absolute top-0 left-0 flex size-12 items-center justify-center rounded-full bg-royal text-lg font-semibold text-on-royal lg:relative">
                {index + 1}
              </span>
              <Card padding="md" className="mt-0 h-44 lg:mt-5">
                {FIGURES[index]}
              </Card>
              <h4 className="mt-5 text-lg font-semibold tracking-tight text-royal">{step.title}</h4>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

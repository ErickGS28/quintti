// import { BadgeCheck, Gauge, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { landingCopy } from "@/copy/landing.es";

import { BudgetFigure } from "../figures/BudgetFigure";
import { CouncilFigure } from "../figures/CouncilFigure";
import { ProposalFigure } from "../figures/ProposalFigure";
import { ReceiptFigure } from "../figures/ReceiptFigure";

const { solution } = landingCopy;

// const RULE_ICONS: ReactNode[] = [
//   <Gauge key="limit" className="size-6" aria-hidden="true" />,
//   <BadgeCheck key="vendors" className="size-6" aria-hidden="true" />,
//   <UsersRound key="council" className="size-6" aria-hidden="true" />,
// ];

const FIGURES: ReactNode[] = [
  <BudgetFigure key="budget" />,
  <ProposalFigure key="proposal" />,
  <CouncilFigure key="council" />,
  <ReceiptFigure key="receipt" />,
];

/** What Quintti does. Two screens exist, the three rules and the four steps of an expense; only the steps are on for now. */
export function SolutionSection() {
  return (
    <>
      {/* The three-rules screen ("La solución") is off for now to keep the walkthrough short. Restore it by uncommenting, together with RULE_ICONS and the imports above.
      <Chapter id={solution.id} tone="royal">
        <ScreenHeading eyebrow={solution.eyebrow} title={solution.title} lead={solution.lead} />
        <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 md:grid-cols-3">
          {solution.rules.map((rule, index) => (
            <li key={rule.title} className="reveal">
              <Card surface="glass" padding="lg" spotlight className="h-full">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-on-royal">
                  {RULE_ICONS[index]}
                </span>
                <p className="mt-5 font-mono text-xs font-medium tracking-[0.16em] text-slide-accent uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-xl font-bold tracking-tight">{rule.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty">{rule.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Chapter>
      */}

      <Chapter id={solution.stepsId} tone="royal">
        <ScreenHeading eyebrow={solution.stepsEyebrow} title={solution.stepsTitle} />
        <ol className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {solution.steps.map((step, index) => (
            <li key={step.title} className="reveal">
              <Card padding="md" className="h-44">
                {FIGURES[index]}
              </Card>
              <div className="mt-5 flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-on-royal">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-pretty">{step.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Chapter>
    </>
  );
}

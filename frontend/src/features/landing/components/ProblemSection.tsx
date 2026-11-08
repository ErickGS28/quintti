import { EyeOff, Hand, History, Scale } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { landingCopy } from "@/copy/landing.es";

const { problem } = landingCopy;

const ICONS: ReactNode[] = [
  <EyeOff key="hidden" className="size-6" aria-hidden="true" />,
  <Scale key="budget" className="size-6" aria-hidden="true" />,
  <Hand key="hand" className="size-6" aria-hidden="true" />,
  <History key="history" className="size-6" aria-hidden="true" />,
];

/** The pain, in four everyday situations. Rose is the only tint; wine marks the icons. */
export function ProblemSection() {
  return (
    <Chapter id={problem.id} tone="rose">
      <ScreenHeading eyebrow={problem.eyebrow} title={problem.title} lead={problem.lead} keepLead />
      <ul className="mt-[clamp(1.5rem,5vh,3rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problem.items.map((item, index) => (
          <li key={item.title} className="reveal">
            <Card padding="md" spotlight className="h-full short:p-4 sm:p-6 sm:short:p-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-coral-soft text-wine short:size-10">
                {ICONS[index]}
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-balance short:mt-3">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-pretty">{item.body}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="reveal mt-8 text-center text-[length:clamp(1.125rem,1.7vw,1.5rem)] font-semibold tracking-tight text-wine short:hidden">
        {problem.closing}
      </p>
    </Chapter>
  );
}

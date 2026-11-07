import { EyeOff, Hand, History, Scale } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { landingCopy } from "@/copy/landing.es";

const { problem } = landingCopy;

const ICONS: ReactNode[] = [
  <EyeOff key="hidden" className="size-6" aria-hidden="true" />,
  <Scale key="budget" className="size-6" aria-hidden="true" />,
  <Hand key="hand" className="size-6" aria-hidden="true" />,
  <History key="history" className="size-6" aria-hidden="true" />,
];

/** The pain, in four everyday situations. Coral marks the problem side of the story. */
export function ProblemSection() {
  return (
    <section id={problem.id} className="scroll-mt-28 bg-mist">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow={problem.eyebrow} title={problem.title} description={problem.body} />
        <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {problem.items.map((item, index) => (
            <li key={item.title} className="flex gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-coral-soft text-wine">
                {ICONS[index]}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-sm text-ink-faint">{problem.note}</p>
      </div>
    </section>
  );
}

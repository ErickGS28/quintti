import { EyeOff, Hand, History, Scale } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { Chapter } from "@/components/molecules/Chapter";
import { Slide } from "@/components/molecules/Slide";
import { TitleSlide } from "@/components/molecules/TitleSlide";
import { landingCopy } from "@/copy/landing.es";

const { problem } = landingCopy;

const ICONS: ReactNode[] = [
  <EyeOff key="hidden" className="size-8" aria-hidden="true" />,
  <Scale key="budget" className="size-8" aria-hidden="true" />,
  <Hand key="hand" className="size-8" aria-hidden="true" />,
  <History key="history" className="size-8" aria-hidden="true" />,
];

/** The pain, in four everyday situations. Wine and coral mark the problem side of the story. */
export function ProblemSection() {
  return (
    <Chapter id={problem.id} tone="wine">
      <TitleSlide index="01" title={problem.eyebrow} lead={problem.title} />
      <Slide>
        <p className="reveal mx-auto max-w-3xl text-center text-[length:clamp(1.25rem,2.2vw,1.875rem)] leading-relaxed text-pretty text-slide-text">
          {problem.body}
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:gap-6">
          {problem.items.map((item, index) => (
            <li key={item.title} className="reveal">
              <Card surface="glass" padding="lg" spotlight className="relative h-full overflow-hidden sm:p-8">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 right-6 text-[7rem] leading-none font-black text-coral/20 select-none"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative flex size-16 items-center justify-center rounded-full bg-coral text-on-coral">
                  {ICONS[index]}
                </span>
                <h3 className="relative mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h3>
                <p className="relative mt-3 text-lg leading-relaxed text-pretty text-slide-text sm:text-xl">
                  {item.body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-base text-slide-muted">{problem.note}</p>
      </Slide>
    </Chapter>
  );
}

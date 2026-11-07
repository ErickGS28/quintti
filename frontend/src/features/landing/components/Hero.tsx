import { ArrowRight } from "lucide-react";

import { BlurInText } from "@/components/atoms/BlurInText";
import { BrandMark } from "@/components/atoms/BrandMark";
import { ButtonLink } from "@/components/atoms/Button";
import { landingCopy } from "@/copy/landing.es";

const { hero, solution, example } = landingCopy;

/**
 * Minimal, centered opening: logo, name, three words, one sentence and two actions.
 * Sizes and gaps follow the height of the window (vh), so everything fits with room to spare
 * at any zoom level and the buttons never touch the bottom edge.
 */
export function Hero() {
  return (
    <section id={hero.id} className="relative flex min-h-[calc(100dvh-5.5rem)] items-center justify-center overflow-hidden px-5 py-[clamp(2rem,7vh,5rem)] sm:px-8">
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute top-1/2 left-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 sm:size-[52rem]"
      />

      <div className="relative flex max-w-3xl flex-col items-center text-center">
        <div className="animate-rise">
          <BrandMark className="size-[clamp(4.5rem,15vh,9rem)]" />
        </div>

        <h1 className="mt-[clamp(0.5rem,2vh,1.25rem)] text-[length:clamp(3.5rem,min(14vh,22vw),8rem)] leading-[1.05] font-bold tracking-tight">
          <BlurInText text="Quintti" />
        </h1>

        <p className="animate-rise mt-[clamp(0.75rem,2.5vh,1.5rem)] text-[length:clamp(0.75rem,1.9vh,1.125rem)] font-bold tracking-[0.18em] text-wine uppercase [animation-delay:900ms]">
          {hero.accent.join(" · ")}
        </p>

        <p className="animate-rise mt-[clamp(1rem,3.5vh,2rem)] max-w-xl text-pretty text-[length:clamp(1rem,2.3vh,1.25rem)] leading-relaxed text-ink-soft [animation-delay:1050ms]">
          {hero.body}
        </p>

        <div className="animate-rise mt-[clamp(1.25rem,4.5vh,2.5rem)] flex flex-wrap justify-center gap-3 [animation-delay:1200ms]">
          <ButtonLink href={`#${solution.id}`} size="lg" shape="pill">
            {hero.primary}
            <ArrowRight className="size-5" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href={`#${example.id}`} size="lg" shape="pill" variant="soft">
            {hero.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

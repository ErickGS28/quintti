import { ChevronDown } from "lucide-react";

import { Eyebrow } from "@/components/atoms/Eyebrow";
import { Ripple } from "@/components/atoms/Ripple";

type TitleSlideProps = {
  /** Chapter number shown above the title, for example "01". */
  index: string;
  /** Word before the number, for example "Capítulo". */
  indexLabel: string;
  /** The chapter name, set very large. This is the section's heading. */
  title: string;
  /** One sentence under the title that states the chapter's point. */
  lead: string;
  /** Hides the scroll cue, for the last chapters. */
  cue?: boolean;
};

/**
 * Opening screen of a chapter: a large title, centered, and the point of the chapter in a sentence.
 * It takes about three quarters of the window, so a chapter starts like a new slide and the next
 * screen already peeks in. Colors come from the chapter's tone.
 */
export function TitleSlide({ index, indexLabel, title, lead, cue = true }: TitleSlideProps) {
  return (
    <div className="relative flex min-h-[78dvh] snap-start flex-col items-center justify-center px-5 pt-28 pb-24 text-center sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-slide-ring">
        <div className="relative size-[min(130vw,76rem)] shrink-0">
          <Ripple tone="current" rings={4} />
        </div>
      </div>

      <div className="reveal relative text-slide-accent">
        <Eyebrow>
          {indexLabel} {index}
        </Eyebrow>
      </div>
      <h2 className="reveal relative mt-6 text-[length:clamp(2.75rem,7vw,6.5rem)] leading-[0.98] font-bold tracking-[-0.04em] text-balance">
        {title}
      </h2>
      <p className="reveal relative mt-6 max-w-3xl text-[length:clamp(1.25rem,2.2vw,2rem)] leading-snug font-semibold text-balance text-slide-accent">
        {lead}
      </p>

      {cue && (
        <ChevronDown
          aria-hidden="true"
          className="absolute bottom-8 size-9 animate-nudge text-slide-muted"
          strokeWidth={2.5}
        />
      )}
    </div>
  );
}

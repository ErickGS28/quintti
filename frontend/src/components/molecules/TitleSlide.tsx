import { ChevronDown } from "lucide-react";

import { Ripple } from "@/components/atoms/Ripple";

type TitleSlideProps = {
  /** Chapter number shown above the title, for example "01". Decorative. */
  index: string;
  /** The chapter name, set very large. This is the section's heading. */
  title: string;
  /** One sentence under the title that states the chapter's point. */
  lead: string;
  /** Hides the scroll cue, for the last chapters. */
  cue?: boolean;
};

/**
 * Opening screen of a chapter: one huge word, centered, and the point of the chapter in a sentence.
 * It fills the window so each chapter starts like a new slide. Colors come from the chapter's tone.
 */
export function TitleSlide({ index, title, lead, cue = true }: TitleSlideProps) {
  return (
    <div className="relative flex min-h-dvh snap-start flex-col items-center justify-center px-5 pt-28 pb-24 text-center sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-slide-ring">
        <div className="relative size-[min(130vw,76rem)] shrink-0">
          <Ripple tone="current" rings={4} />
        </div>
      </div>

      <p
        aria-hidden="true"
        className="reveal relative text-[length:clamp(0.875rem,1.6vw,1.25rem)] font-bold tracking-[0.4em] text-slide-accent"
      >
        {index}
      </p>
      <h2 className="reveal relative mt-5 text-[length:clamp(3rem,10.5vw,9.5rem)] leading-[0.95] font-bold tracking-tight text-balance">
        {title}
      </h2>
      <p className="reveal relative mt-8 max-w-4xl text-[length:clamp(1.375rem,3vw,2.75rem)] leading-snug font-semibold text-balance text-slide-accent">
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

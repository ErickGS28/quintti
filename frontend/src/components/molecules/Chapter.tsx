import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

export type ChapterTone = "night" | "wine" | "royal" | "mist" | "periwinkle" | "canvas" | "finale";

type ChapterProps = {
  id?: string;
  tone: ChapterTone;
  children: ReactNode;
  className?: string;
};

const TONES: Record<ChapterTone, string> = {
  night: "tone-night",
  wine: "tone-wine",
  royal: "tone-royal",
  mist: "tone-mist",
  periwinkle: "tone-periwinkle",
  canvas: "tone-canvas",
  finale: "tone-finale",
};

/**
 * One chapter of the landing page: a full-width block with its own gradient and text colors (see
 * `.tone-*` in `globals.css`). It slides up over the previous one with rounded top corners, like a
 * sheet, so the page reads as a stack of screens.
 */
export function Chapter({ id, tone, children, className }: ChapterProps) {
  return (
    <section
      id={id}
      className={classNames(
        "chapter grain -mt-10 rounded-t-[2.5rem] sm:-mt-14 sm:rounded-t-[3.5rem]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

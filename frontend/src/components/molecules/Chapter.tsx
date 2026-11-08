import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

export type ChapterTone = "rose" | "royal" | "mist" | "lilac";

type ChapterProps = {
  id?: string;
  tone: ChapterTone;
  children: ReactNode;
  /** Classes for the content box, for example to change its width. */
  contentClassName?: string;
};

const TONES: Record<ChapterTone, string> = {
  rose: "tone-rose",
  royal: "tone-royal",
  mist: "tone-mist",
  lilac: "tone-lilac",
};

/**
 * One screen of the landing page, like a slide: at least one window tall, its content centered, with
 * its own quiet gradient and text colors (see `.tone-*` in `globals.css`). Scrolling settles on it.
 * The top padding keeps the content clear of the floating menu. On a phone, where the content can be
 * taller than the window, the screen simply grows.
 */
export function Chapter({ id, tone, children, contentClassName }: ChapterProps) {
  return (
    <section
      id={id}
      className={classNames(
        "chapter flex min-h-dvh snap-start flex-col justify-center px-5 pt-[clamp(5rem,11vh,7rem)] pb-[clamp(2.5rem,7vh,4.5rem)] short:pb-8 sm:px-8",
        TONES[tone],
      )}
    >
      <div className={classNames("mx-auto w-full max-w-6xl", contentClassName)}>{children}</div>
    </section>
  );
}

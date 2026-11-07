import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

type SlideProps = {
  children: ReactNode;
  /** "wide" for grids of cards, "narrow" for a single column of text. */
  width?: "wide" | "narrow";
  className?: string;
};

const WIDTHS = {
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
};

/**
 * A content screen inside a chapter: at least one window tall, content centered vertically, and a
 * snap point so scrolling settles on it. It grows past the window when the content needs more room.
 */
export function Slide({ children, width = "wide", className }: SlideProps) {
  return (
    <div className="snap-start">
      <div
        className={classNames(
          "mx-auto flex min-h-dvh flex-col justify-center px-5 py-20 sm:px-8 sm:py-24",
          WIDTHS[width],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

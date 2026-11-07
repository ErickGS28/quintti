import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

type EyebrowProps = {
  children: ReactNode;
  /** A small dot before the text. "live" adds a soft ping, for a status that is on. */
  dot?: "none" | "still" | "live";
  className?: string;
};

/**
 * A short monospaced label in a hairline pill, set above a title. It takes the text color of its
 * surface, so it works on any chapter; the dot is coral, which only decorates.
 */
export function Eyebrow({ children, dot = "none", className }: EyebrowProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2.5 rounded-full bg-current/6 px-3.5 py-1.5 font-mono text-xs font-medium tracking-[0.16em] uppercase ring-1 ring-current/15 sm:text-[0.8125rem]",
        className,
      )}
    >
      {dot !== "none" && (
        <span aria-hidden="true" className="relative flex size-2">
          {dot === "live" && <span className="absolute inset-0 animate-ping-soft rounded-full bg-coral" />}
          <span className="relative size-2 rounded-full bg-coral" />
        </span>
      )}
      {children}
    </span>
  );
}

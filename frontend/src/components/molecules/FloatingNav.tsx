import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

type FloatingNavProps = {
  label: string;
  children: ReactNode;
  /** "top" sticks under the top edge; "bottom" floats above the screen edge on phones. */
  placement: "top" | "bottom";
  /**
   * "fit" hugs its content, for a few links. "wide" is for menus with several items: it takes
   * 75% of the width on large screens and never more than 92% on phones.
   */
  width?: "fit" | "wide";
  className?: string;
};

const WIDTHS = {
  fit: "w-fit max-w-[92%]",
  wide: "w-[min(92%,26rem)] sm:w-[min(75%,64rem)]",
};

/**
 * Rounded navigation bar that floats instead of spanning the screen.
 * It only provides the surface; the items come from the caller.
 */
export function FloatingNav({ label, children, placement, width = "wide", className }: FloatingNavProps) {
  return (
    <div
      className={classNames(
        "pointer-events-none z-30 flex justify-center px-4",
        placement === "top" ? "sticky top-4" : "fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <nav
        aria-label={label}
        className={classNames(
          "pointer-events-auto flex items-center gap-1 rounded-full bg-veil p-1.5 shadow-float backdrop-blur-xl",
          WIDTHS[width],
        )}
      >
        {children}
      </nav>
    </div>
  );
}

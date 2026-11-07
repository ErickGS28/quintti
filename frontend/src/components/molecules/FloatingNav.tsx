import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

type FloatingNavProps = {
  label: string;
  children: ReactNode;
  /** "top" sticks under the top edge; "bottom" floats above the screen edge on phones. */
  placement: "top" | "bottom";
  /**
   * "fit" hugs its content, for a few links. "wide" is for menus with several items: it takes
   * 75% of the width on large screens and never more than 92% on phones. "full" is for a bar with
   * a brand, links and an action: almost the whole width, up to a reading width.
   */
  width?: "fit" | "wide" | "full";
  /** "light" is frosted white. "night" is dark glass that reads over any chapter, light or dark. */
  surface?: "light" | "night";
  className?: string;
};

const WIDTHS = {
  fit: "w-fit max-w-[92%]",
  wide: "w-[min(92%,26rem)] sm:w-[min(75%,64rem)]",
  full: "w-[min(94%,72rem)]",
};

const SURFACES = {
  light: "bg-veil shadow-float",
  night:
    "bg-night-glass text-periwinkle-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_0_0_1px_rgb(255_255_255/0.08),0_24px_48px_-20px_rgb(15_10_42/0.65)]",
};

/**
 * Rounded navigation bar that floats instead of spanning the screen.
 * It only provides the surface; the items come from the caller.
 */
export function FloatingNav({
  label,
  children,
  placement,
  width = "wide",
  surface = "light",
  className,
}: FloatingNavProps) {
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
          "pointer-events-auto flex items-center gap-1 rounded-full p-1.5 backdrop-blur-xl backdrop-saturate-150",
          SURFACES[surface],
          WIDTHS[width],
        )}
      >
        {children}
      </nav>
    </div>
  );
}

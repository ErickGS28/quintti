import { useId } from "react";

import { classNames } from "@/lib/ui/class-names";

import { LOGO_BIRD_PATHS, LOGO_RING_PATHS, LOGO_VIEW_BOX } from "./brand-mark-paths";

type BrandMarkProps = {
  /** Size comes from the caller, for example "size-12". */
  className: string;
  /**
   * "light" for white surfaces: a lavender-to-royal ring and a deep purple bird.
   * "night" for dark surfaces: a periwinkle-to-coral ring and a white bird.
   */
  tone?: "light" | "night";
};

const RING_STOPS = {
  light: ["var(--lavender)", "var(--royal)"],
  night: ["var(--periwinkle)", "var(--coral)"],
};

const BIRD = {
  light: "text-royal-strong",
  night: "text-canvas",
};

/**
 * The Quintti hummingbird inside its open ring. The mark spins once when it, or the group it
 * belongs to, is hovered.
 */
export function BrandMark({ className, tone = "light" }: BrandMarkProps) {
  const gradientId = `ring-${useId().replace(/:/g, "")}`;
  const [from, to] = RING_STOPS[tone];

  return (
    <svg
      className={classNames(BIRD[tone], "hover:animate-spin-once group-hover:animate-spin-once", className)}
      viewBox={LOGO_VIEW_BOX}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      {LOGO_RING_PATHS.map((path) => (
        <path key={path.d.slice(0, 24)} d={path.d} transform={path.transform} fill={`url(#${gradientId})`} />
      ))}
      {LOGO_BIRD_PATHS.map((path) => (
        <path key={path.d.slice(0, 24)} d={path.d} transform={path.transform} fill="currentColor" />
      ))}
    </svg>
  );
}

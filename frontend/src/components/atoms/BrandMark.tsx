import { useId } from "react";

import { classNames } from "@/lib/ui/class-names";

import { LOGO_BIRD_PATHS, LOGO_RING_PATHS, LOGO_VIEW_BOX } from "./brand-mark-paths";

type BrandMarkProps = {
  /** Size comes from the caller, for example "size-12". */
  className: string;
};

/**
 * The Quintti hummingbird inside its open ring. The ring is a gradient from lavender to royal purple and
 * the bird is deep purple. The mark spins once when it, or the group it belongs to, is hovered.
 */
export function BrandMark({ className }: BrandMarkProps) {
  const gradientId = `ring-${useId().replace(/:/g, "")}`;

  return (
    <svg
      className={classNames("text-royal-strong hover:animate-spin-once group-hover:animate-spin-once", className)}
      viewBox={LOGO_VIEW_BOX}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--lavender)" />
          <stop offset="1" stopColor="var(--royal)" />
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

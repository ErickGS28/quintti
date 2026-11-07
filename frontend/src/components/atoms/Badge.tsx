import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

export type BadgeTone = "royal" | "coral" | "neutral";

const TONES: Record<BadgeTone, string> = {
  royal: "bg-royal-soft text-royal",
  coral: "bg-coral-soft text-wine",
  neutral: "bg-mist text-ink-soft",
};

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

/** A short status label. The text carries the meaning; the color only supports it. */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

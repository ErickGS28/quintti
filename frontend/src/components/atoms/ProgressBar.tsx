import { classNames } from "@/lib/ui/class-names";

type ProgressBarProps = {
  /** From 0 to 1. */
  value: number;
  /** "royal" for normal use; "coral" when the bar is close to its limit. */
  tone?: "royal" | "coral";
  /** Read by screen readers, for example "Mantenimiento: 80% usado". */
  label?: string;
  className?: string;
};

const FILLS = {
  royal: "from-lavender to-royal",
  coral: "from-coral to-wine",
};

/** A rounded bar that fills from the left. */
export function ProgressBar({ value, tone = "royal", label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuenow={label ? percent : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      className={classNames("h-2 overflow-hidden rounded-full bg-periwinkle-soft", className)}
    >
      <div
        className={classNames("h-full origin-left rounded-full bg-gradient-to-r transition-[width] duration-700", FILLS[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

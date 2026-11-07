import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** A line under the value, for example what it is out of. */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Extra content at the bottom, for example a progress bar. */
  children?: ReactNode;
};

/** One figure that matters, with its label and context. */
export function StatCard({ label, value, hint, icon, children }: StatCardProps) {
  return (
    <Card padding="md" spotlight className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{label}</p>
        {icon && (
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-royal-soft text-royal">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-[length:clamp(1.375rem,4vw,1.75rem)] leading-tight font-semibold tracking-[-0.03em] text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-faint">{hint}</p>}
      {children && <div className="mt-auto pt-4">{children}</div>}
    </Card>
  );
}

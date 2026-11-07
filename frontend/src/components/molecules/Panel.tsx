import type { ReactNode } from "react";

import { Card } from "@/components/atoms/Card";
import { classNames } from "@/lib/ui/class-names";

type PanelProps = {
  title: string;
  /** A short line under the title. */
  description?: ReactNode;
  /** A link or button on the right of the title. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** A titled card: one topic per panel, so a screen reads as a set of clear blocks. */
export function Panel({ title, description, action, children, className }: PanelProps) {
  return (
    <Card padding="none" className={classNames("overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-soft">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-5 pt-4 pb-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

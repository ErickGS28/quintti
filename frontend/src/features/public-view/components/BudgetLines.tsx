import { ProgressBar } from "@/components/atoms/ProgressBar";
import { appCopy } from "@/copy/app.es";
import { categoryLabel } from "@/lib/format/category";
import { formatTokenAmount } from "@/lib/format/token";
import { spentShare } from "@/lib/treasury/approvals";

import type { BudgetLineView } from "../types";

/** Above this share a line turns coral, so a category close to its limit stands out. */
const WARNING_SHARE = 0.9;

type BudgetLinesProps = {
  budgets: readonly BudgetLineView[];
  /** Shows what is left of each line under its bar. */
  detailed?: boolean;
  /** Renders something at the end of each line, for example an edit button. */
  trailing?: (line: BudgetLineView) => React.ReactNode;
};

/** Each category with what was paid against its limit. */
export function BudgetLines({ budgets, detailed = false, trailing }: BudgetLinesProps) {
  const { budget } = appCopy;
  return (
    <ul className="grid gap-5">
      {budgets.map((line) => {
        const share = spentShare(line);
        const percent = Math.round(share * 100);
        return (
          <li key={line.category}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-[0.9375rem] font-semibold text-ink">{categoryLabel(line.category)}</p>
              <p className="text-sm text-ink-faint tabular-nums">
                <span className="font-semibold text-ink">{formatTokenAmount(line.spent)}</span> /{" "}
                {formatTokenAmount(line.limit)}
              </p>
            </div>
            <ProgressBar
              value={share}
              tone={share >= WARNING_SHARE ? "coral" : "royal"}
              label={`${categoryLabel(line.category)}: ${budget.share(percent)}`}
              className="mt-2"
            />
            {(detailed || trailing) && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="text-ink-soft">
                  {budget.remaining}:{" "}
                  <span className="font-semibold text-ink tabular-nums">{formatTokenAmount(line.remaining)}</span>
                  <span className="text-ink-faint"> · {budget.share(percent)}</span>
                </p>
                {trailing?.(line)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

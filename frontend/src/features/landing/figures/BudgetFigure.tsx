import { landingCopy } from "@/copy/landing.es";

const { budget } = landingCopy.figures;

/** How full each illustrative category is. Decorative: the rows carry the meaning. */
const FILL = [0.62, 0.38, 0.2];

/** Step 1: the assembly's budget, one bar per category with its limit. */
export function BudgetFigure() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col justify-center gap-3.5">
      {budget.rows.map((row, index) => (
        <div key={row}>
          <p className="text-xs font-semibold text-ink-soft">{row}</p>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-periwinkle-soft">
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-lavender to-royal"
              style={{ width: `${FILL[index] * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

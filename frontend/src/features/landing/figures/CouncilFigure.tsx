import { Check } from "lucide-react";

import { classNames } from "@/lib/ui/class-names";
import { landingCopy } from "@/copy/landing.es";

const { council } = landingCopy.figures;
const MEMBERS = ["A", "B", "C"];
const SIGNED = 2;

/** Step 3: three council members, two of whom have signed. */
export function CouncilFigure() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{council.title}</p>
      <div className="flex items-center gap-3">
        {MEMBERS.map((member, index) => {
          const signed = index < SIGNED;
          return (
            <span
              key={member}
              className={classNames(
                "relative flex size-12 items-center justify-center rounded-full text-base font-semibold",
                signed ? "bg-royal text-on-royal" : "bg-mist text-ink-soft ring-1 ring-hairline-strong",
              )}
            >
              {member}
              {signed && (
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-periwinkle text-ink ring-2 ring-cloud">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <p className="text-sm font-semibold text-royal">{council.progress}</p>
    </div>
  );
}

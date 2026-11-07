import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

import { FIELD } from "./field-styles";

/** A native select with the field look, so keyboard and screen reader behavior come for free. */
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={classNames(FIELD, "min-h-12 cursor-pointer appearance-none pr-11", className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}

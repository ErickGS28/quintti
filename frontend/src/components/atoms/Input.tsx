import type { InputHTMLAttributes, ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

import { FIELD } from "./field-styles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Short text at the end of the field, for example the token code after an amount. */
  suffix?: ReactNode;
};

/** A single-line text field. */
export function Input({ suffix, className, ...rest }: InputProps) {
  if (!suffix) {
    return <input className={classNames(FIELD, "min-h-12", className)} {...rest} />;
  }
  return (
    <div className="relative">
      <input className={classNames(FIELD, "min-h-12 pr-20", className)} {...rest} />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm font-medium text-ink-faint">
        {suffix}
      </span>
    </div>
  );
}

import type { LabelHTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

/** The name of a form control. */
export function Label({ className, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={classNames("text-sm font-semibold text-ink", className)} {...rest} />;
}

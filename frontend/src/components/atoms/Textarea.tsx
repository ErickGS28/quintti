import type { TextareaHTMLAttributes } from "react";

import { classNames } from "@/lib/ui/class-names";

import { FIELD } from "./field-styles";

/** A multi-line text field. */
export function Textarea({ className, rows = 3, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={classNames(FIELD, "resize-y py-3 leading-relaxed", className)} {...rest} />;
}

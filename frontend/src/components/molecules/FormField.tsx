import { useId, type ReactNode } from "react";

import { Label } from "@/components/atoms/Label";

/** What a control needs to be tied to its label, hint and error. */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FormFieldProps = {
  label: string;
  /** A short help text under the control. */
  hint?: ReactNode;
  /** The problem with the value. When set, the control is marked invalid. */
  error?: string;
  /** Text at the right of the label, for example what is still available. */
  aside?: ReactNode;
  /** Renders the control with the ids it needs, so the label and the messages point at it. */
  children: (control: FieldControlProps) => ReactNode;
};

/** A label, a control, and its hint or error, wired together for assistive technology. */
export function FormField({ label, hint, error, aside, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {aside && <span className="text-right text-sm text-ink-faint">{aside}</span>}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-wine">
          {error}
        </p>
      )}
    </div>
  );
}

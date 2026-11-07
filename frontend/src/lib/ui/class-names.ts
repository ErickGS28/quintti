type ClassValue = string | false | null | undefined;

/** Joins class names, skipping falsy values. */
export function classNames(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}

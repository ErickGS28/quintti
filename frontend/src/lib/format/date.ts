export interface TimeDisplay {
  locale?: string;
  /** IANA time zone. Defaults to the viewer's own. */
  timeZone?: string;
}

/**
 * Shows a ledger timestamp. The contract stores time as seconds since the
 * Unix epoch, which arrives as a `bigint` from the generated bindings.
 */
export function formatLedgerTime(
  seconds: bigint | number,
  { locale = "es", timeZone }: TimeDisplay = {},
): string {
  const milliseconds = Number(seconds) * 1000;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(milliseconds));
}

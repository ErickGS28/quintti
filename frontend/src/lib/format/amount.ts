/** Thrown when text cannot be read as an amount. */
export class AmountFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AmountFormatError";
  }
}

export interface AmountDisplay {
  /** Decimals of the token (7 for Stellar Asset Contract tokens). */
  decimals: number;
  /** Token code shown after the number, for example "XLM". */
  symbol: string;
  /** Locale for digit grouping and the decimal separator. */
  locale?: string;
}

function scale(decimals: number): bigint {
  return 10n ** BigInt(decimals);
}

function decimalSeparator(locale: string): string {
  const part = new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find((candidate) => candidate.type === "decimal");
  return part?.value ?? ".";
}

/**
 * Shows an amount held in base units, always with its token code.
 * Uses only integer arithmetic, so no precision is lost.
 */
export function formatAmount(
  baseUnits: bigint,
  { decimals, symbol, locale = "es" }: AmountDisplay,
): string {
  const negative = baseUnits < 0n;
  const absolute = negative ? -baseUnits : baseUnits;
  const unit = scale(decimals);

  const whole = absolute / unit;
  const fraction = (absolute % unit).toString().padStart(decimals, "0").replace(/0+$/, "");

  const groupedWhole = new Intl.NumberFormat(locale, { useGrouping: true }).format(whole);
  const number = fraction ? `${groupedWhole}${decimalSeparator(locale)}${fraction}` : groupedWhole;
  return `${negative ? "-" : ""}${number} ${symbol}`;
}

/**
 * Reads text typed by a person into base units. Accepts digits with an
 * optional decimal part separated by "." or ",". Thousands separators, signs
 * and exponents are rejected because they make the meaning ambiguous.
 *
 * Errors: `AmountFormatError`.
 */
export function parseAmount(text: string, decimals: number): bigint {
  const match = /^(\d+)(?:[.,](\d+))?$/.exec(text.trim());
  if (!match) {
    throw new AmountFormatError("Enter digits with an optional decimal part");
  }
  const [, whole, fraction = ""] = match;
  if (fraction.length > decimals) {
    throw new AmountFormatError(`At most ${decimals} decimal places are allowed`);
  }
  return BigInt(whole) * scale(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
}

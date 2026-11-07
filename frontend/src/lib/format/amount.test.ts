import { describe, expect, it } from "vitest";

import { AmountFormatError, formatAmount, parseAmount } from "./amount";

const xlm = { decimals: 7, symbol: "XLM", locale: "en" };

describe("formatAmount", () => {
  it("shows whole amounts without decimals", () => {
    expect(formatAmount(800_000_000n, xlm)).toBe("80 XLM");
    expect(formatAmount(0n, xlm)).toBe("0 XLM");
  });

  it("shows the fraction without trailing zeros", () => {
    expect(formatAmount(15_000_000n, xlm)).toBe("1.5 XLM");
    expect(formatAmount(1n, xlm)).toBe("0.0000001 XLM");
  });

  it("groups thousands using the locale", () => {
    expect(formatAmount(12_345_670_000_000n, xlm)).toBe("1,234,567 XLM");
    expect(formatAmount(12_345_670_000_000n, { ...xlm, locale: "es-CO" })).toBe("1.234.567 XLM");
  });

  it("uses the locale's decimal separator", () => {
    expect(formatAmount(15_000_000n, { ...xlm, locale: "es-CO" })).toBe("1,5 XLM");
  });

  it("keeps full precision for amounts beyond the safe integer range", () => {
    expect(formatAmount(170_141_183_460_469_231_731_687_303_715_884_105_727n, xlm)).toBe(
      "17,014,118,346,046,923,173,168,730,371,588.4105727 XLM",
    );
  });

  it("shows negative amounts with a sign", () => {
    expect(formatAmount(-5_000_000n, xlm)).toBe("-0.5 XLM");
  });

  it("supports tokens without decimals", () => {
    expect(formatAmount(42n, { decimals: 0, symbol: "PTS", locale: "en" })).toBe("42 PTS");
  });
});

describe("parseAmount", () => {
  it("converts whole and decimal amounts to base units", () => {
    expect(parseAmount("80", 7)).toBe(800_000_000n);
    expect(parseAmount("1.5", 7)).toBe(15_000_000n);
    expect(parseAmount("0.0000001", 7)).toBe(1n);
  });

  it("accepts a comma as the decimal separator and ignores surrounding spaces", () => {
    expect(parseAmount(" 2,25 ", 7)).toBe(22_500_000n);
  });

  it("round-trips with formatAmount", () => {
    for (const units of [0n, 1n, 15_000_000n, 800_000_000n, 123_456_789_012n]) {
      const text = formatAmount(units, { decimals: 7, symbol: "XLM", locale: "en" })
        .replace(" XLM", "")
        .replaceAll(",", "");
      expect(parseAmount(text, 7)).toBe(units);
    }
  });

  it("rejects text that is not a plain non-negative amount", () => {
    for (const text of ["", "abc", "-1", "+1", "1e3", "1,000.50", "1.", ".5", "1.2.3", "0x10"]) {
      expect(() => parseAmount(text, 7), text).toThrow(AmountFormatError);
    }
  });

  it("rejects more decimal places than the token supports", () => {
    expect(() => parseAmount("0.00000001", 7)).toThrow(/At most 7 decimal places/);
    expect(() => parseAmount("1.5", 0)).toThrow(AmountFormatError);
  });
});

import { describe, expect, it } from "vitest";

import { shortenAddress } from "./address";
import { formatLedgerTime } from "./date";

describe("shortenAddress", () => {
  it("keeps the first and last characters", () => {
    expect(shortenAddress("GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK")).toBe(
      "GBWM…6LAK",
    );
  });

  it("returns short values unchanged", () => {
    expect(shortenAddress("GABC")).toBe("GABC");
    expect(shortenAddress("123456789")).toBe("123456789");
  });

  it("supports custom lengths", () => {
    expect(shortenAddress("ABCDEFGHIJKLMNOP", 2, 3)).toBe("AB…NOP");
  });
});

describe("formatLedgerTime", () => {
  // Some ICU versions put a narrow no-break space before AM/PM; compare plain spaces.
  const plain = (text: string) => text.replace(/\s/g, " ");

  it("formats seconds since the epoch in the requested time zone", () => {
    const shown = formatLedgerTime(1_794_078_021n, { locale: "en", timeZone: "UTC" });

    expect(plain(shown)).toBe("Nov 7, 2026, 7:00 PM");
  });

  it("accepts a plain number", () => {
    expect(plain(formatLedgerTime(0, { locale: "en", timeZone: "UTC" }))).toBe(
      "Jan 1, 1970, 12:00 AM",
    );
  });
});

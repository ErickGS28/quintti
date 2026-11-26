import { describe, expect, it } from "vitest";

import { hiwMainnetCopy } from "./hiw.es";
import { landingMainnetFooterLine } from "./landing.es";

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

describe("the texts shown when the app is built for mainnet", () => {
  const texts = [...allStrings(hiwMainnetCopy), landingMainnetFooterLine];

  it("never claim the network is a test or that no real money is involved", () => {
    for (const text of texts) {
      expect(text).not.toMatch(/red de pruebas|testnet|sin dinero real|no hay dinero real/i);
    }
  });

  it("say it is an unaudited beta and ask for symbolic amounts", () => {
    expect(landingMainnetFooterLine).toMatch(/sin auditar/);
    expect(landingMainnetFooterLine).toMatch(/montos simbólicos/);
    expect(hiwMainnetCopy.trialBody).toMatch(/sin auditar/);
    expect(hiwMainnetCopy.limitsFirstItem).toMatch(/sin auditor/);
  });
});

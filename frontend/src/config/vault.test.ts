import { describe, expect, it } from "vitest";

import { parseVaultSetting } from "./vault";

const VAULT = "CCWAQ2MNYYFWYSTJAQMRI45CYJTGEBLY4YQ2NZOMLE663TSB64CBTORL";

describe("parseVaultSetting", () => {
  it("accepts a contract address and trims it", () => {
    expect(parseVaultSetting(VAULT)).toEqual({ status: "ready", contractId: VAULT });
    expect(parseVaultSetting(`  ${VAULT}\n`)).toEqual({ status: "ready", contractId: VAULT });
  });

  it("reports a missing value instead of failing the build", () => {
    expect(parseVaultSetting(undefined)).toEqual({ status: "missing" });
    expect(parseVaultSetting("")).toEqual({ status: "missing" });
    expect(parseVaultSetting("   ")).toEqual({ status: "missing" });
  });

  it("rejects anything that is not a contract address", () => {
    expect(parseVaultSetting("GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK")).toEqual({ status: "invalid" });
    expect(parseVaultSetting("C123")).toEqual({ status: "invalid" });
    expect(parseVaultSetting("not an address")).toEqual({ status: "invalid" });
  });
});

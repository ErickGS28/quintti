// Optional check against a real treasury on testnet: the server reads the invoice fingerprint of an
// expense from the contract itself before it accepts a file. Skipped unless QUINTTI_LIVE=1, like the
// other checks in this folder. Needs a treasury with at least one expense (docs/06-getting-started.md).

import { describe, expect, it } from "vitest";

import { parseConfig } from "@/config/env";
import { onChainInvoiceHash } from "@/features/expense-details/server/on-chain-invoice";

const live = process.env.QUINTTI_LIVE === "1";

describe.skipIf(!live)("invoice fingerprints on testnet (live)", { timeout: 60_000 }, () => {
  const lookup = () =>
    onChainInvoiceHash(
      parseConfig({
        network: "testnet",
        treasuryContractId: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID,
        tokenSymbol: "XLM",
      }),
    );

  it("reads the fingerprint of an existing expense as 64 hexadecimal characters", async () => {
    expect(await lookup()(0)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("answers null for an expense that does not exist", async () => {
    expect(await lookup()(4_000_000)).toBeNull();
  });
});

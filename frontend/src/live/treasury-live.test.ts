// Optional checks against a real treasury on testnet. They are skipped unless
// QUINTTI_LIVE=1, so `npm test` stays offline and deterministic. Run them with:
//
//   QUINTTI_LIVE=1 NEXT_PUBLIC_TREASURY_CONTRACT_ID=C... npm test
//
// The contract must have the state described in docs/06-getting-started.md:
// a `maintenance` budget of 1,000 XLM, one paid expense of 80 XLM, and a
// treasury balance of 420 XLM. `QUINTTI_LIVE_ADMIN` is the administrator's address.

import { describe, expect, it } from "vitest";

import { parseConfig } from "@/config/env";
import { createTreasuryReader } from "@/features/public-view/services/treasury-reader";

import { createTreasuryClient } from "@/lib/stellar/treasury-client";
import { CALL_OPTIONS, readResult, readValue } from "@/lib/stellar/transaction-service";

const live = process.env.QUINTTI_LIVE === "1";

describe.skipIf(!live)("treasury on testnet (live)", { timeout: 60_000 }, () => {
  // Built lazily: the body of a skipped `describe` still runs, and it must not
  // need an environment that only exists when the live checks are enabled.
  const setup = () => {
    const config = parseConfig({
      network: "testnet",
      treasuryContractId: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID,
      tokenSymbol: "XLM",
    });
    return { config, client: createTreasuryClient(config) };
  };

  it("reads the configuration", async () => {
    const { client } = setup();

    const treasury = await readResult(() => client.get_config(CALL_OPTIONS));

    expect(treasury.threshold).toBe(2);
  });

  it("reads the balance and a budget line", async () => {
    const { client } = setup();

    const balance = await readResult(() => client.balance(CALL_OPTIONS));
    const budget = await readValue(() => client.get_budget({ category: "maintenance" }, CALL_OPTIONS));

    expect(balance).toBe(4_200_000_000n);
    expect(budget).toMatchObject({ limit: 10_000_000_000n, spent: 800_000_000n });
  });

  it("reads a paid expense", async () => {
    const { client } = setup();

    const expense = await readResult(() => client.get_expense({ id: 0 }, CALL_OPTIONS));

    expect(expense.status.tag).toBe("Paid");
    expect(expense.amount).toBe(800_000_000n);
  });

  it("builds the public view from the contract's state", async () => {
    const { client } = setup();
    const reader = createTreasuryReader(client);

    const snapshot = await reader.snapshot();
    const expenses = await reader.expenses();

    expect(snapshot.council).toHaveLength(3);
    expect(snapshot.threshold).toBe(2);
    expect(snapshot.balance).toBe(4_200_000_000n);
    expect(snapshot.budgets).toEqual([
      { category: "maintenance", limit: 10_000_000_000n, spent: 800_000_000n, remaining: 9_200_000_000n },
    ]);
    expect(snapshot.vendors).toHaveLength(1);
    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toMatchObject({ id: 0, status: "paid", amount: 800_000_000n });
    expect(expenses[0].invoiceHash).toBe("5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8");
    expect(expenses[0].approvals).toHaveLength(2);
    expect(expenses[0].paidAt).not.toBeNull();
  });

  it("reports an unknown expense as a contract error", async () => {
    const { client } = setup();

    await expect(readResult(() => client.get_expense({ id: 999 }, CALL_OPTIONS))).rejects.toMatchObject({
      kind: "contract",
      contractError: "ExpenseNotFound",
    });
  });

  it("rejects an over-budget proposal at simulation, before any signature", async () => {
    const { config } = setup();
    const admin = process.env.QUINTTI_LIVE_ADMIN;
    const vendor = process.env.QUINTTI_LIVE_VENDOR;
    expect(admin, "set QUINTTI_LIVE_ADMIN to the administrator's address").toBeTruthy();
    expect(vendor, "set QUINTTI_LIVE_VENDOR to the approved vendor's address").toBeTruthy();
    const adminClient = createTreasuryClient(config, {
      address: admin!,
      signTransaction: () => Promise.reject(new Error("must not be asked to sign")),
    });

    await expect(
      readResult(() =>
        adminClient.propose_expense(
          { category: "maintenance", vendor: vendor!, amount: 9_500_000_000n, invoice_hash: Buffer.alloc(32, 7) },
          CALL_OPTIONS,
        ),
      ),
    ).rejects.toMatchObject({ kind: "contract", contractError: "OverBudget" });
  });
});

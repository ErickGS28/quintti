import { nativeToScVal } from "@stellar/stellar-sdk";
import { describe, expect, it, vi } from "vitest";

import { OTHER_ADDRESS, TEST_ADDRESS, testConfig } from "@/test-support/fakes";

import { readTokenBalance, type SimulatingServer } from "./token-balance";

const TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

/** What the RPC answers to a simulation that worked, carrying `value` as the call's result. */
function success(value: unknown) {
  return { id: "1", latestLedger: 1, transactionData: {}, result: { retval: value } };
}

function server(answer: unknown): SimulatingServer & { simulateTransaction: ReturnType<typeof vi.fn> } {
  return { simulateTransaction: vi.fn().mockResolvedValue(answer) } as never;
}

describe("readTokenBalance", () => {
  it("returns what the token says the account holds, as a bigint", async () => {
    const fake = server(success(nativeToScVal(99_820_773_824n, { type: "i128" })));

    await expect(readTokenBalance(testConfig, TOKEN, TEST_ADDRESS, fake)).resolves.toBe(99_820_773_824n);
  });

  it("asks the token for the balance of the given account, and only simulates it", async () => {
    const fake = server(success(nativeToScVal(0n, { type: "i128" })));

    await readTokenBalance(testConfig, TOKEN, OTHER_ADDRESS, fake);

    expect(fake.simulateTransaction).toHaveBeenCalledTimes(1);
    const transaction = fake.simulateTransaction.mock.calls[0][0];
    expect(transaction.operations).toHaveLength(1);
    expect(transaction.source).toBe(OTHER_ADDRESS);
    expect(transaction.networkPassphrase).toBe(testConfig.networkPassphrase);
    expect(JSON.stringify(transaction.operations[0], (_, v) => (typeof v === "bigint" ? v.toString() : v))).toContain("balance");
  });

  it("turns a failed simulation into an AppError", async () => {
    const fake = server({ id: "1", latestLedger: 1, error: "HostError: Error(WasmVm, MissingValue)" });

    await expect(readTokenBalance(testConfig, TOKEN, TEST_ADDRESS, fake)).rejects.toMatchObject({ name: "AppError" });
  });

  it("refuses an answer that is not a number", async () => {
    const fake = server(success(nativeToScVal("not a balance", { type: "string" })));

    await expect(readTokenBalance(testConfig, TOKEN, TEST_ADDRESS, fake)).rejects.toMatchObject({ name: "AppError" });
  });

  it("refuses an answer that has no result", async () => {
    const fake = server({ id: "1", latestLedger: 1, transactionData: {}, result: undefined });

    await expect(readTokenBalance(testConfig, TOKEN, TEST_ADDRESS, fake)).rejects.toMatchObject({ name: "AppError" });
  });

  it("turns a network failure into an AppError", async () => {
    const fake = { simulateTransaction: vi.fn().mockRejectedValue(new Error("fetch failed")) };

    await expect(readTokenBalance(testConfig, TOKEN, TEST_ADDRESS, fake as never)).rejects.toMatchObject({
      kind: "network",
    });
  });
});
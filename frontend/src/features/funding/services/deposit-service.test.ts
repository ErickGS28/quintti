import { describe, expect, it, vi } from "vitest";

import { MAX_AMOUNT } from "@/config/constants";
import type { Client } from "@/contracts/generated";
import { TEST_ADDRESS, confirmedTransaction, fakeWallet, testConfig } from "@/test-support/fakes";

import { createDepositService } from "./deposit-service";

function setup(deposit: unknown) {
  const wallet = fakeWallet();
  const createClient = vi.fn().mockReturnValue({ deposit } as unknown as Client);
  return { wallet, createClient, service: createDepositService({ config: testConfig, wallet, createClient }) };
}

describe("deposit", () => {
  it("pays from the connected account and returns the receipt", async () => {
    const deposit = vi.fn().mockResolvedValue(confirmedTransaction(undefined, "deposited"));
    const { service } = setup(deposit);

    const receipt = await service.deposit({ amount: 1_500_000_000n });

    expect(deposit.mock.calls[0][0]).toEqual({ from: TEST_ADDRESS, amount: 1_500_000_000n });
    expect(receipt).toMatchObject({ hash: "deposited" });
  });

  it("rejects an amount that is not positive, before touching the wallet or the network", async () => {
    const deposit = vi.fn();
    const { service, wallet, createClient } = setup(deposit);

    for (const amount of [0n, -1n, MAX_AMOUNT + 1n]) {
      await expect(service.deposit({ amount })).rejects.toMatchObject({ kind: "invalid-input", field: "amount" });
    }
    expect(wallet.getAddress).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(deposit).not.toHaveBeenCalled();
  });

  it("does not need any role: any connected account may pay", async () => {
    const deposit = vi.fn().mockResolvedValue(confirmedTransaction(undefined));
    const { service } = setup(deposit);

    await expect(service.deposit({ amount: 1n })).resolves.toBeDefined();
  });
});

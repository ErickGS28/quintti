import { describe, expect, it, vi } from "vitest";

import type { Client } from "@/contracts/generated";
import { toHex } from "@/lib/hash/sha256";
import { OTHER_ADDRESS, TEST_ADDRESS, confirmedTransaction, fakeWallet, testConfig } from "@/test-support/fakes";

import { createExpenseService } from "./expense-service";

// SHA-256 of "factura-ascensor-0001", the sample invoice of the testnet walkthrough.
const SAMPLE_HASH = "5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8";

function setup(methods: Partial<Record<"propose_expense" | "approve_expense" | "cancel_expense", unknown>>) {
  const wallet = fakeWallet();
  const client = methods as unknown as Client;
  const createClient = vi.fn().mockReturnValue(client);
  return { wallet, createClient, service: createExpenseService({ config: testConfig, wallet, createClient }) };
}

const invoice = new Blob(["factura-ascensor-0001"]);

describe("propose", () => {
  it("sends the invoice fingerprint, not the file, and returns the new expense id", async () => {
    const propose_expense = vi.fn().mockResolvedValue(confirmedTransaction(4, "proposed"));
    const { service } = setup({ propose_expense });

    const receipt = await service.propose({
      category: " maintenance ",
      vendor: OTHER_ADDRESS,
      amount: 800_000_000n,
      invoice,
    });

    const [args] = propose_expense.mock.calls[0];
    expect(args.category).toBe("maintenance");
    expect(args.vendor).toBe(OTHER_ADDRESS);
    expect(args.amount).toBe(800_000_000n);
    expect(toHex(args.invoice_hash)).toBe(SAMPLE_HASH);
    expect(receipt).toMatchObject({ hash: "proposed", value: 4 });
  });

  it("rejects bad input before touching the wallet or the network", async () => {
    const propose_expense = vi.fn();
    const { service, wallet, createClient } = setup({ propose_expense });

    for (const input of [
      { category: "bad name", vendor: OTHER_ADDRESS, amount: 1n, invoice },
      { category: "maintenance", vendor: "nope", amount: 1n, invoice },
      { category: "maintenance", vendor: OTHER_ADDRESS, amount: 0n, invoice },
      { category: "maintenance", vendor: OTHER_ADDRESS, amount: 1n, invoice: new Blob([]) },
    ]) {
      await expect(service.propose(input)).rejects.toMatchObject({ kind: "invalid-input" });
    }
    expect(wallet.getAddress).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(propose_expense).not.toHaveBeenCalled();
  });
});

describe("approve", () => {
  it("approves as the connected account", async () => {
    const approve_expense = vi.fn().mockResolvedValue(confirmedTransaction(undefined, "approved"));
    const { service } = setup({ approve_expense });

    const receipt = await service.approve(2);

    expect(approve_expense.mock.calls[0][0]).toEqual({ approver: TEST_ADDRESS, id: 2 });
    expect(receipt.hash).toBe("approved");
  });

  it("rejects an id that is not a whole number", async () => {
    const { service } = setup({ approve_expense: vi.fn() });

    for (const id of [-1, 1.5, Number.NaN, 2 ** 32]) {
      await expect(service.approve(id)).rejects.toMatchObject({ kind: "invalid-input", field: "id" });
    }
  });
});

describe("cancel", () => {
  it("cancels as the connected account", async () => {
    const cancel_expense = vi.fn().mockResolvedValue(confirmedTransaction(undefined, "cancelled"));
    const { service } = setup({ cancel_expense });

    await service.cancel(0);

    expect(cancel_expense.mock.calls[0][0]).toEqual({ caller: TEST_ADDRESS, id: 0 });
  });
});

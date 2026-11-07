import { describe, expect, it, vi } from "vitest";

import { EXPENSES_PAGE_SIZE } from "@/config/constants";
import type { Client, Expense } from "@/contracts/generated";
import { OTHER_ADDRESS, TEST_ADDRESS, plainReadOf, readOf } from "@/test-support/fakes";

import { createTreasuryReader } from "./treasury-reader";

const hash = Buffer.alloc(32, 0xab);

function expense(id: number, overrides: Partial<Expense> = {}): Expense {
  return {
    id,
    category: "maintenance",
    vendor: OTHER_ADDRESS,
    amount: 100n,
    invoice_hash: hash,
    approvals: [TEST_ADDRESS],
    status: { tag: "Pending", values: undefined },
    created_at: 1_000n,
    paid_at: undefined,
    ...overrides,
  };
}

function fakeClient(overrides: Record<string, unknown> = {}): Client {
  return {
    get_config: vi.fn().mockResolvedValue(
      readOf({ token: "CTOKEN", assembly: "GASSEMBLY", administrator: "GADMIN", threshold: 2 }),
    ),
    get_council: vi.fn().mockResolvedValue(plainReadOf(["GC1", "GC2", "GC3"])),
    balance: vi.fn().mockResolvedValue(readOf(4_200_000_000n)),
    list_categories: vi.fn().mockResolvedValue(plainReadOf(["maintenance", "security"])),
    list_vendors: vi.fn().mockResolvedValue(plainReadOf([OTHER_ADDRESS])),
    expense_count: vi.fn().mockResolvedValue(plainReadOf(0)),
    get_budget: vi.fn().mockImplementation(async ({ category }: { category: string }) =>
      plainReadOf(category === "maintenance" ? { limit: 10_000n, spent: 3_000n } : { limit: 500n, spent: 0n }),
    ),
    ...overrides,
  } as unknown as Client;
}

describe("snapshot", () => {
  it("combines roles, council, balance, budgets and vendors", async () => {
    const snapshot = await createTreasuryReader(fakeClient()).snapshot();

    expect(snapshot).toEqual({
      token: "CTOKEN",
      assembly: "GASSEMBLY",
      administrator: "GADMIN",
      threshold: 2,
      council: ["GC1", "GC2", "GC3"],
      balance: 4_200_000_000n,
      budgets: [
        { category: "maintenance", limit: 10_000n, spent: 3_000n, remaining: 7_000n },
        { category: "security", limit: 500n, spent: 0n, remaining: 500n },
      ],
      vendors: [OTHER_ADDRESS],
      expenseCount: 0,
    });
  });

  it("skips a category whose budget line has disappeared", async () => {
    const client = fakeClient({ get_budget: vi.fn().mockResolvedValue(plainReadOf(undefined)) });

    expect((await createTreasuryReader(client).snapshot()).budgets).toEqual([]);
  });

  it("reports a read failure as an AppError", async () => {
    const client = fakeClient({ balance: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")) });

    await expect(createTreasuryReader(client).snapshot()).rejects.toMatchObject({ kind: "network" });
  });
});

describe("expenses", () => {
  it("returns nothing when no expense was proposed", async () => {
    const get_expenses = vi.fn();

    const result = await createTreasuryReader(fakeClient({ get_expenses })).expenses();

    expect(result).toEqual([]);
    expect(get_expenses).not.toHaveBeenCalled();
  });

  it("maps status, hash and times", async () => {
    const paid = expense(0, { status: { tag: "Paid", values: undefined }, paid_at: 2_000n });
    const cancelled = expense(1, { status: { tag: "Cancelled", values: undefined } });
    const client = fakeClient({
      expense_count: vi.fn().mockResolvedValue(plainReadOf(3)),
      get_expenses: vi.fn().mockResolvedValue(plainReadOf([paid, cancelled, expense(2)])),
    });

    const result = await createTreasuryReader(client).expenses();

    expect(result.map((item) => item.status)).toEqual(["paid", "cancelled", "pending"]);
    expect(result[0]).toMatchObject({ id: 0, amount: 100n, paidAt: 2_000n, createdAt: 1_000n });
    expect(result[0].invoiceHash).toBe("ab".repeat(32));
    expect(result[2].paidAt).toBeNull();
  });

  it("reads every page of the history", async () => {
    const total = EXPENSES_PAGE_SIZE + 5;
    const get_expenses = vi.fn().mockImplementation(async ({ from, limit }: { from: number; limit: number }) =>
      plainReadOf(Array.from({ length: Math.min(limit, total - from) }, (_, index) => expense(from + index))),
    );
    const client = fakeClient({
      expense_count: vi.fn().mockResolvedValue(plainReadOf(total)),
      get_expenses,
    });

    const result = await createTreasuryReader(client).expenses();

    expect(result.map((item) => item.id)).toEqual(Array.from({ length: total }, (_, id) => id));
    expect(get_expenses).toHaveBeenCalledTimes(2);
    expect(get_expenses.mock.calls[1][0]).toEqual({ from: EXPENSES_PAGE_SIZE, limit: EXPENSES_PAGE_SIZE });
  });

  it("stops if the contract returns an empty page", async () => {
    const get_expenses = vi.fn().mockResolvedValue(plainReadOf([]));
    const client = fakeClient({ expense_count: vi.fn().mockResolvedValue(plainReadOf(100)), get_expenses });

    expect(await createTreasuryReader(client).expenses()).toEqual([]);
    expect(get_expenses).toHaveBeenCalledOnce();
  });
});

describe("expense", () => {
  it("returns one expense", async () => {
    const client = fakeClient({ get_expense: vi.fn().mockResolvedValue(readOf(expense(7))) });

    expect(await createTreasuryReader(client).expense(7)).toMatchObject({ id: 7, status: "pending" });
  });
});

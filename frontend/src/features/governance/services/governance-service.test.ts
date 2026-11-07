import { describe, expect, it, vi } from "vitest";

import type { Client } from "@/contracts/generated";
import { OTHER_ADDRESS, TEST_ADDRESS, confirmedTransaction, fakeWallet, testConfig } from "@/test-support/fakes";

import { createGovernanceService } from "./governance-service";

type Method = "set_budget" | "set_vendor" | "set_administrator" | "rotate_council";

function setup(method: Method) {
  const call = vi.fn().mockResolvedValue(confirmedTransaction(undefined, `${method}-hash`));
  const client = { [method]: call } as unknown as Client;
  const wallet = fakeWallet();
  const service = createGovernanceService({ config: testConfig, wallet, createClient: () => client });
  return { call, wallet, service };
}

describe("setBudget", () => {
  it("sets a limit in base units", async () => {
    const { call, service } = setup("set_budget");

    const receipt = await service.setBudget({ category: "security", limit: 5_000_000_000n });

    expect(call.mock.calls[0][0]).toEqual({ category: "security", limit: 5_000_000_000n });
    expect(receipt.hash).toBe("set_budget-hash");
  });

  it("rejects a bad category or a zero limit without using the wallet", async () => {
    const { wallet, service } = setup("set_budget");

    await expect(service.setBudget({ category: "bad name", limit: 1n })).rejects.toMatchObject({ field: "category" });
    await expect(service.setBudget({ category: "security", limit: 0n })).rejects.toMatchObject({ field: "limit" });
    expect(wallet.getAddress).not.toHaveBeenCalled();
  });
});

describe("setVendor", () => {
  it("approves or removes a vendor", async () => {
    const { call, service } = setup("set_vendor");

    await service.setVendor({ vendor: OTHER_ADDRESS, allowed: true });
    await service.setVendor({ vendor: OTHER_ADDRESS, allowed: false });

    expect(call.mock.calls.map(([args]) => args.allowed)).toEqual([true, false]);
  });

  it("rejects an invalid address", async () => {
    const { service } = setup("set_vendor");

    await expect(service.setVendor({ vendor: "nope", allowed: true })).rejects.toMatchObject({ field: "vendor" });
  });
});

describe("setAdministrator", () => {
  it("replaces the administrator", async () => {
    const { call, service } = setup("set_administrator");

    await service.setAdministrator(OTHER_ADDRESS);

    expect(call.mock.calls[0][0]).toEqual({ administrator: OTHER_ADDRESS });
  });
});

describe("rotateCouncil", () => {
  it("replaces the council and the threshold", async () => {
    const { call, service } = setup("rotate_council");

    await service.rotateCouncil({ council: [TEST_ADDRESS, OTHER_ADDRESS], threshold: 2 });

    expect(call.mock.calls[0][0]).toEqual({ council: [TEST_ADDRESS, OTHER_ADDRESS], threshold: 2 });
  });

  it("rejects an invalid member or threshold before sending anything", async () => {
    const { call, service } = setup("rotate_council");

    await expect(service.rotateCouncil({ council: [TEST_ADDRESS, "nope"], threshold: 1 })).rejects.toMatchObject({
      field: "council",
    });
    await expect(service.rotateCouncil({ council: [TEST_ADDRESS], threshold: -1 })).rejects.toMatchObject({
      field: "threshold",
    });
    expect(call).not.toHaveBeenCalled();
  });
});

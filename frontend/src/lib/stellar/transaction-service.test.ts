import type { contract } from "@stellar/stellar-sdk";
import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "@/config/env";
import { AppError } from "@/lib/errors/app-error";

import { readResult, readValue, sendAndConfirm } from "./transaction-service";

const config: AppConfig = {
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  treasuryContractId: "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA",
  token: { symbol: "XLM", decimals: 7 },
  explorerBaseUrl: "https://stellar.expert/explorer/testnet",
};

const ok = <T>(value: T): contract.Result<T> => ({
  isOk: () => true,
  isErr: () => false,
  unwrap: () => value,
  unwrapErr: () => {
    throw new Error("not an error");
  },
});

const err = (message: string): contract.Result<never> => ({
  isOk: () => false,
  isErr: () => true,
  unwrap: () => {
    throw new Error("is an error");
  },
  unwrapErr: () => ({ message }),
});

/** A stand-in for an assembled transaction that only has what the service uses. */
function fakeTransaction<T>(
  signAndSend: () => Promise<unknown>,
  result?: contract.Result<T>,
): contract.AssembledTransaction<contract.Result<T>> {
  return { signAndSend, result } as unknown as contract.AssembledTransaction<contract.Result<T>>;
}

function sentWith(hash: string | undefined, result: contract.Result<unknown>) {
  return { sendTransactionResponse: hash ? { hash } : undefined, result };
}

describe("readResult", () => {
  it("returns the value of a successful read", async () => {
    const value = await readResult(async () => fakeTransaction(vi.fn(), ok(42)));

    expect(value).toBe(42);
  });

  it("turns a contract Err result into an AppError", async () => {
    await expect(readResult(async () => fakeTransaction(vi.fn(), err("ExpenseNotFound")))).rejects.toMatchObject({
      kind: "contract",
      contractError: "ExpenseNotFound",
    });
  });

  it("turns a failed simulation into an AppError", async () => {
    const failing = async () => {
      throw new Error("simulation failed: HostError: Error(Contract, #12)");
    };

    await expect(readResult(failing)).rejects.toMatchObject({ contractError: "OverBudget" });
  });
});

describe("readValue", () => {
  it("returns a plain value", async () => {
    const tx = { result: "maintenance" } as unknown as contract.AssembledTransaction<string>;

    expect(await readValue(async () => tx)).toBe("maintenance");
  });

  it("wraps failures", async () => {
    await expect(
      readValue(async () => {
        throw new TypeError("Failed to fetch");
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe("sendAndConfirm", () => {
  it("signs, sends and returns the hash, the explorer link and the value", async () => {
    const signAndSend = vi.fn().mockResolvedValue(sentWith("abc123", ok(7)));

    const receipt = await sendAndConfirm(config, async () => fakeTransaction(signAndSend));

    expect(signAndSend).toHaveBeenCalledOnce();
    expect(receipt).toEqual({
      hash: "abc123",
      explorerUrl: "https://stellar.expert/explorer/testnet/tx/abc123",
      value: 7,
    });
  });

  it("falls back to the hash of the final status when the send response has none", async () => {
    const sent = { sendTransactionResponse: undefined, getTransactionResponse: { txHash: "fromstatus" }, result: ok(1) };

    const receipt = await sendAndConfirm(config, async () => fakeTransaction(async () => sent));

    expect(receipt.hash).toBe("fromstatus");
  });

  it("surfaces a rule that rejects the call while it is still only simulated", async () => {
    const prepare = async () => {
      throw new Error("HostError: Error(Contract, #12)");
    };

    await expect(sendAndConfirm(config, prepare)).rejects.toMatchObject({
      kind: "contract",
      contractError: "OverBudget",
    });
  });

  it("never asks for a signature when the simulation reports an error", async () => {
    const signAndSend = vi.fn();
    const rejected = {
      signAndSend,
      simulation: { error: "HostError: Error(Contract, #12)", events: [], id: "1", latestLedger: 1, _parsed: true },
      result: err("No expense exists with that id."),
    } as unknown as contract.AssembledTransaction<contract.Result<number>>;

    await expect(sendAndConfirm(config, async () => rejected)).rejects.toMatchObject({
      kind: "contract",
      contractError: "OverBudget",
    });
    expect(signAndSend).not.toHaveBeenCalled();
  });

  it("keeps the contract error's name on reads whose simulation failed", async () => {
    const rejected = {
      simulation: { error: "HostError: Error(Contract, #13)", events: [], id: "1", latestLedger: 1, _parsed: true },
      result: err("No expense exists with that id."),
    } as unknown as contract.AssembledTransaction<contract.Result<number>>;

    await expect(readResult(async () => rejected)).rejects.toMatchObject({ contractError: "ExpenseNotFound" });
  });

  it("reports a contract Err found in the final result", async () => {
    const signAndSend = vi.fn().mockResolvedValue(sentWith("abc", err("OverBudget")));

    await expect(sendAndConfirm(config, async () => fakeTransaction(signAndSend))).rejects.toMatchObject({
      kind: "contract",
      contractError: "OverBudget",
    });
  });

  it("passes on a rejected wallet prompt as an AppError", async () => {
    const rejected = new Error("closed");
    const signAndSend = vi.fn().mockRejectedValue(new AppError("wallet-rejected", "closed", { cause: rejected }));

    await expect(sendAndConfirm(config, async () => fakeTransaction(signAndSend))).rejects.toMatchObject({
      kind: "wallet-rejected",
    });
  });

  it("fails clearly when the network confirms without a hash", async () => {
    const signAndSend = vi.fn().mockResolvedValue(sentWith(undefined, ok(1)));

    await expect(sendAndConfirm(config, async () => fakeTransaction(signAndSend))).rejects.toMatchObject({
      kind: "unknown",
    });
  });
});

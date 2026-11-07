import { contract } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors/app-error";

import { fromContractResultError, toAppError } from "./to-app-error";

const build = contract.AssembledTransaction.Errors;
const send = contract.SentTransaction.Errors;

describe("toAppError", () => {
  it("recognizes a contract error in a simulation failure", () => {
    const error = toAppError(new Error("transaction simulation failed: HostError: Error(Contract, #12)"));

    expect(error.kind).toBe("contract");
    expect(error.contractError).toBe("OverBudget");
  });

  it("keeps a contract error even when its code is unknown", () => {
    const error = toAppError(new Error("HostError: Error(Contract, #99)"));

    expect(error.kind).toBe("contract");
    expect(error.contractError).toBeUndefined();
  });

  it("reports a closed wallet prompt as a rejection", () => {
    expect(toAppError(new build.UserRejected("The user declined")).kind).toBe("wallet-rejected");
  });

  it("reports a missing signer or wallet failure as unavailable", () => {
    expect(toAppError(new build.NoSigner("no signer")).kind).toBe("wallet-unavailable");
    expect(toAppError(new build.InternalWalletError("wallet broke")).kind).toBe("wallet-unavailable");
  });

  it("reports a transaction that never became final as a timeout", () => {
    expect(toAppError(new send.TransactionStillPending("still pending")).kind).toBe("timeout");
  });

  it("reports expired contract state", () => {
    expect(toAppError(new build.ExpiredState("expired")).kind).toBe("state-expired");
    expect(toAppError(new build.RestorationFailure("restore failed")).kind).toBe("state-expired");
  });

  it("reports connection problems as network errors", () => {
    expect(toAppError(new send.SendFailed("rejected")).kind).toBe("network");
    expect(toAppError(new TypeError("Failed to fetch")).kind).toBe("network");
    expect(toAppError(new Error("getaddrinfo ENOTFOUND soroban-testnet.stellar.org")).kind).toBe("network");
  });

  it("falls back to unknown and keeps the original message and cause", () => {
    const original = new Error("something odd");
    const error = toAppError(original);

    expect(error.kind).toBe("unknown");
    expect(error.message).toBe("something odd");
    expect(error.cause).toBe(original);
  });

  it("handles values that are not errors", () => {
    expect(toAppError("plain text").message).toBe("plain text");
  });

  it("returns an AppError unchanged", () => {
    const existing = new AppError("timeout", "too slow");

    expect(toAppError(existing)).toBe(existing);
  });
});

describe("fromContractResultError", () => {
  it("names the contract error", () => {
    const error = fromContractResultError("VendorNotApproved");

    expect(error.kind).toBe("contract");
    expect(error.contractError).toBe("VendorNotApproved");
  });

  it("does not invent a name for an unknown error", () => {
    expect(fromContractResultError("Mystery").contractError).toBeUndefined();
  });
});

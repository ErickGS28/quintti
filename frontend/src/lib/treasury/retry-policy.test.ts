import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors/app-error";

import { shouldRetry } from "./retry-policy";

describe("shouldRetry", () => {
  it("retries network failures a couple of times", () => {
    const error = new AppError("network", "offline");

    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });

  it("never retries a failure that would repeat", () => {
    for (const kind of ["contract", "invalid-input", "wallet-rejected", "wallet-network", "timeout"] as const) {
      expect(shouldRetry(0, new AppError(kind, "x")), kind).toBe(false);
    }
  });

  it("does not retry errors that are not AppErrors", () => {
    expect(shouldRetry(0, new Error("odd"))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors/app-error";
import { CONTRACT_ERROR_NAMES } from "@/lib/stellar/contract-errors";

import { appErrorMessages, contractErrorMessages, describeError } from "./errors.es";

describe("error messages", () => {
  it("cover every contract error with a non-empty message", () => {
    for (const name of CONTRACT_ERROR_NAMES) {
      expect(contractErrorMessages[name]?.trim(), name).toBeTruthy();
    }
    expect(Object.keys(contractErrorMessages)).toHaveLength(CONTRACT_ERROR_NAMES.length);
  });

  it("end as complete sentences", () => {
    const all = [...Object.values(contractErrorMessages), ...Object.values(appErrorMessages)];

    for (const message of all) {
      expect(message, message).toMatch(/[.]$/);
    }
  });
});

describe("describeError", () => {
  it("explains a contract rule by its name", () => {
    const error = new AppError("contract", "x", { contractError: "OverBudget" });

    expect(describeError(error)).toBe(contractErrorMessages.OverBudget);
  });

  it("has a fallback for a contract error it does not know", () => {
    expect(describeError(new AppError("contract", "x"))).toBe("El contrato rechazó la operación.");
    expect(describeError(new AppError("contract", "x", { contractError: "Mystery" }))).toBe(
      "El contrato rechazó la operación.",
    );
  });

  it("explains failures that are not contract rules", () => {
    expect(describeError(new AppError("wallet-rejected", "x"))).toBe(appErrorMessages["wallet-rejected"]);
    expect(describeError(new AppError("network", "x"))).toBe(appErrorMessages.network);
  });
});

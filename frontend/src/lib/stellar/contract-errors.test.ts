import { describe, expect, it } from "vitest";

import { Errors } from "@/contracts/generated";

import {
  CONTRACT_ERROR_NAMES,
  contractErrorName,
  findContractErrorCode,
  isContractErrorName,
} from "./contract-errors";

describe("contract error names", () => {
  it("match the errors in the generated bindings, code by code", () => {
    const generated = Object.entries(Errors).map(([code, error]) => [Number(code), error.message]);

    expect(generated).toHaveLength(CONTRACT_ERROR_NAMES.length);
    for (const [code, name] of generated) {
      expect(contractErrorName(Number(code)), `error #${code}`).toBe(name);
    }
  });

  it("look up a name from its numeric code", () => {
    expect(contractErrorName(12)).toBe("OverBudget");
    expect(contractErrorName(15)).toBe("NotCouncilMember");
    expect(contractErrorName(0)).toBeUndefined();
    expect(contractErrorName(20)).toBeUndefined();
  });

  it("recognize a valid name", () => {
    expect(isContractErrorName("OverBudget")).toBe(true);
    expect(isContractErrorName("Nope")).toBe(false);
  });
});

describe("findContractErrorCode", () => {
  it("reads the code from RPC and SDK messages", () => {
    expect(findContractErrorCode("transaction simulation failed: HostError: Error(Contract, #12)")).toBe(12);
    expect(findContractErrorCode('Error(Contract, #5)], data:"escalating"')).toBe(5);
  });

  it("ignores messages without a contract error", () => {
    expect(findContractErrorCode("Error(Auth, InvalidAction)")).toBeUndefined();
    expect(findContractErrorCode("something else")).toBeUndefined();
  });
});

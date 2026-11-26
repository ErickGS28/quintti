import { describe, expect, it } from "vitest";

import { Errors } from "@/contracts/vault-generated";
import { vaultErrorMessages } from "@/copy/boveda.es";
import { AppError } from "@/lib/errors/app-error";

import { VAULT_ERROR_NAMES, isVaultErrorName, toVaultError, vaultErrorName } from "./vault-errors";

describe("the vault's error names", () => {
  it("match the generated bindings, in code order", () => {
    const fromBindings = Object.entries(Errors)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, { message }]) => message);

    expect([...VAULT_ERROR_NAMES]).toEqual(fromBindings);
  });

  it("have a message for people, and nothing else does", () => {
    expect(Object.keys(vaultErrorMessages).sort()).toEqual([...VAULT_ERROR_NAMES].sort());
  });

  it("are looked up by code, which starts at 1", () => {
    expect(vaultErrorName(1)).toBe("WrongCode");
    expect(vaultErrorName(2)).toBe("AlreadyClaimed");
    expect(vaultErrorName(3)).toBe("VaultEmpty");
    expect(vaultErrorName(5)).toBeUndefined();
    expect(isVaultErrorName("WrongCode")).toBe(true);
    expect(isVaultErrorName("OverBudget")).toBe(false);
    expect(isVaultErrorName(undefined)).toBe(false);
  });
});

describe("toVaultError", () => {
  it("names a code with the vault's table, not the treasury's", () => {
    // In the treasury, #1 is NotInitialized and #2 is InvalidCouncil: reading them there would blame the wrong rule.
    const wrongCode = toVaultError(new Error("HostError: Error(Contract, #1)"));
    const claimed = toVaultError(new Error("HostError: Error(Contract, #2)"));

    expect(wrongCode).toMatchObject({ kind: "contract", contractError: "WrongCode" });
    expect(claimed).toMatchObject({ kind: "contract", contractError: "AlreadyClaimed" });
  });

  it("keeps an unknown code as a contract error without a name", () => {
    expect(toVaultError(new Error("Error(Contract, #99)"))).toMatchObject({ kind: "contract", contractError: undefined });
  });

  it("returns an AppError untouched, so an error from another contract keeps its kind", () => {
    const foreign = new AppError("other-contract", "token said no", { foreignCode: 10 });

    expect(toVaultError(foreign)).toBe(foreign);
  });

  it("leaves wallet and network failures to the usual translation", () => {
    expect(toVaultError(new TypeError("Failed to fetch"))).toMatchObject({ kind: "network" });
  });
});

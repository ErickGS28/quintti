import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors/app-error";

import { describeVaultError, vaultCopy, vaultErrorMessages } from "./boveda.es";

describe("describeVaultError", () => {
  it("says what each of the vault's errors means", () => {
    for (const [name, message] of Object.entries(vaultErrorMessages)) {
      expect(describeVaultError(new AppError("contract", name, { contractError: name }))).toBe(message);
    }
  });

  it("tells a wrong code from the treasury's error that shares its number", () => {
    // NotInitialized is #1 in the treasury. The vault's #1 is a wrong code, and the person must read that.
    const message = describeVaultError(new AppError("contract", "x", { contractError: "WrongCode" }));

    expect(message).toMatch(/código/i);
    expect(message).not.toMatch(/configurada/i);
  });

  it("asks for the code when it is empty", () => {
    expect(describeVaultError(new AppError("invalid-input", "empty", { field: "code" }))).toMatch(/Escribe el código/);
  });

  it("falls back to the usual messages for everything else", () => {
    expect(describeVaultError(new AppError("wallet-rejected", "closed"))).toMatch(/Cancelaste/);
    expect(describeVaultError(new TypeError("boom"))).toMatch(/inesperado/);
  });
});

describe("the page's texts", () => {
  it("are Spanish text without broken characters", () => {
    const everything = JSON.stringify(vaultCopy, (_key, value: unknown) => (typeof value === "function" ? "" : value));

    expect(everything).not.toContain("\uFFFD");
    expect(everything).toContain("Bóveda");
  });
});

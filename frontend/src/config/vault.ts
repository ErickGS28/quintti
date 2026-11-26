import { StrKey } from "@stellar/stellar-sdk";

/** What the environment says about the Ship It vault: a valid contract, nothing, or something wrong. */
export type VaultSetting = { status: "ready"; contractId: string } | { status: "missing" } | { status: "invalid" };

/** Reads the raw value of `NEXT_PUBLIC_VAULT_CONTRACT_ID`. Pure, so it is easy to test. */
export function parseVaultSetting(raw: string | undefined): VaultSetting {
  const contractId = raw?.trim() ?? "";
  if (!contractId) return { status: "missing" };
  return StrKey.isValidContract(contractId) ? { status: "ready", contractId } : { status: "invalid" };
}

/**
 * The vault the `/boveda` page talks to. It is optional: a build without it still works, and the page says
 * the vault is not set up instead of failing. Next.js only inlines `process.env.NEXT_PUBLIC_*` when the
 * name is written out in full.
 */
export function getVaultSetting(): VaultSetting {
  return parseVaultSetting(process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID);
}

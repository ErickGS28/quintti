/** A role the treasury contract recognizes. A resident needs none: reading is open to anyone. */
export type TreasuryRole = "assembly" | "administrator" | "council";

/** Who holds each role, as the contract stores it. */
export interface Governance {
  assembly: string;
  administrator: string;
  council: readonly string[];
}

/** What the connected account may ask the contract to do. The contract checks it again on every call. */
export interface Permissions {
  /** Propose an expense (the administrator). */
  canPropose: boolean;
  /** Approve a pending expense (a council member). */
  canApprove: boolean;
  /** Cancel a pending expense (the administrator or the assembly). */
  canCancel: boolean;
  /** Change the budget, the vendors, the administrator or the council (the assembly). */
  canManageRules: boolean;
}

/**
 * The roles an address holds, in a stable order. An address can hold several (the assembly may also
 * sit on the council), but the contract never lets the administrator be a council member.
 */
export function rolesOf(address: string | null | undefined, governance: Governance): TreasuryRole[] {
  if (!address) return [];
  const roles: TreasuryRole[] = [];
  if (address === governance.assembly) roles.push("assembly");
  if (address === governance.administrator) roles.push("administrator");
  if (governance.council.includes(address)) roles.push("council");
  return roles;
}

export function permissionsOf(roles: readonly TreasuryRole[]): Permissions {
  const has = (role: TreasuryRole) => roles.includes(role);
  return {
    canPropose: has("administrator"),
    canApprove: has("council"),
    canCancel: has("administrator") || has("assembly"),
    canManageRules: has("assembly"),
  };
}

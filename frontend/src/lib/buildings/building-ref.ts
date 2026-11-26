import { StrKey } from "@stellar/stellar-sdk";

/** The query parameter that carries the building's contract address: `/app/?edificio=C...`. */
export const BUILDING_PARAM = "edificio";

/** Whether the text is a valid contract address (starts with C). Says nothing about what the contract is. */
export function isContractAddress(text: string): boolean {
  return StrKey.isValidContract(text);
}

/**
 * The contract address inside what a person pasted: the address itself, or a Quintti link that carries it
 * in the `edificio` parameter. Anything else, including a link to another site, gives null.
 *
 * The input is untrusted (it comes from a link or from a text box), so it is only ever returned when it is
 * a valid contract address.
 */
export function parseBuildingRef(text: string): string | null {
  const value = text.trim();
  if (!value) return null;
  if (isContractAddress(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const fromLink = url.searchParams.get(BUILDING_PARAM)?.trim() ?? "";
  return isContractAddress(fromLink) ? fromLink : null;
}

/**
 * An app path that stays on the same building. For the building the site was configured with
 * (`buildingId` null) the path is left as it is; for any other, the address is added to the address bar so
 * that a refresh, a bookmark or a shared link all open the same building.
 */
export function withBuilding(path: string, buildingId: string | null): string {
  if (!buildingId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${BUILDING_PARAM}=${encodeURIComponent(buildingId)}`;
}

/** The link to share so that anyone, with no account, reads this building. */
export function buildingShareUrl(origin: string, overviewPath: string, buildingId: string): string {
  return `${origin}${withBuilding(overviewPath, buildingId)}`;
}
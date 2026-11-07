import type { Directory } from "../types";

/** The building's profile and the names of known addresses. */
export async function fetchDirectory(fetchImpl: typeof fetch = fetch): Promise<Directory> {
  const response = await fetchImpl("/api/directory", { cache: "no-store" });
  if (!response.ok) throw new Error(`The directory API answered ${response.status}`);
  return (await response.json()) as Directory;
}

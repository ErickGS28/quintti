import { isContractAddress } from "./building-ref";

/** Where the list of saved buildings lives in the browser. */
export const SAVED_BUILDINGS_KEY = "quintti.buildings";

/** More than this is not a list a person manages by hand, and it bounds what a hostile page could store. */
export const MAX_SAVED_BUILDINGS = 20;

/** The part of `localStorage` the list needs, so tests can use a plain object. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Reads the stored list. Anything that is not a list of contract addresses is ignored, never trusted:
 * the value could have been written by an older version, by hand or by another page on the same origin.
 */
export function parseSavedBuildings(raw: string | null): string[] {
  if (!raw) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const unique = new Set<string>();
  for (const item of value) {
    if (typeof item === "string" && isContractAddress(item)) unique.add(item);
    if (unique.size >= MAX_SAVED_BUILDINGS) break;
  }
  return [...unique];
}

/** The list with a building added at the end. Adding one that is there changes nothing. */
export function withSavedBuilding(list: readonly string[], id: string): string[] {
  if (!isContractAddress(id) || list.includes(id)) return [...list];
  return [...list, id].slice(-MAX_SAVED_BUILDINGS);
}

export function withoutSavedBuilding(list: readonly string[], id: string): string[] {
  return list.filter((item) => item !== id);
}

/**
 * A building is trusted when this site was configured with it, or when the person saved it on purpose.
 * Any other building was reached through a link, and a link can say anything: it may point at a contract
 * that only looks like a building. Such a building can be read but nobody can sign anything on it.
 */
export function isTrustedBuilding(id: string, defaultId: string | null, saved: readonly string[]): boolean {
  return id === defaultId || saved.includes(id);
}

type Listener = () => void;

/**
 * The saved list as a small store that React can subscribe to. The snapshot is cached so that it is the
 * same array until the list changes, which `useSyncExternalStore` requires.
 */
export function createSavedBuildingsStore(storage: KeyValueStorage | null) {
  const empty: readonly string[] = [];
  let snapshot: readonly string[] = storage ? safeRead(storage) : empty;
  const listeners = new Set<Listener>();

  function safeRead(source: KeyValueStorage): readonly string[] {
    try {
      return parseSavedBuildings(source.getItem(SAVED_BUILDINGS_KEY));
    } catch {
      return empty;
    }
  }

  function update(next: readonly string[]) {
    snapshot = next;
    try {
      storage?.setItem(SAVED_BUILDINGS_KEY, JSON.stringify(next));
    } catch {
      // Storage can be full or blocked. The list still works until the page is closed.
    }
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: () => snapshot,
    /** What the server renders: nothing is saved before the page reaches the browser. */
    getServerSnapshot: () => empty,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add(id: string) {
      update(withSavedBuilding(snapshot, id));
    },
    remove(id: string) {
      update(withoutSavedBuilding(snapshot, id));
    },
  };
}

export type SavedBuildingsStore = ReturnType<typeof createSavedBuildingsStore>;
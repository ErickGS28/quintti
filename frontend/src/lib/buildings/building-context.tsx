"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { getConfig } from "@/config/env";

import { BUILDING_PARAM, buildingShareUrl, parseBuildingRef, withBuilding } from "./building-ref";
import { createSavedBuildingsStore, isTrustedBuilding, type SavedBuildingsStore } from "./saved-buildings";

/**
 * The building the person is looking at, and what they may do with it.
 *
 * With no backend, a building is a contract address. The site is built with one (the configured building)
 * and any other arrives in the link as `?edificio=C...`. The list of buildings a person saved lives in
 * their browser only.
 */
export interface BuildingContext {
  /** The contract of the building on screen. */
  contractId: string;
  /** The contract this site was built with. */
  defaultId: string;
  /** Whether the building on screen is the configured one. */
  isDefault: boolean;
  /**
   * Whether signing is allowed here: the configured building, or one the person saved on purpose. A building
   * reached through a link can be read, never signed on, until it is saved.
   */
  trusted: boolean;
  /** The link had an `edificio` value that is not a contract address. */
  invalidLink: boolean;
  /** Buildings saved in this browser, oldest first. */
  saved: readonly string[];
  save: (id: string) => void;
  remove: (id: string) => void;
  /** An app path that stays on this building. */
  href: (path: string) => string;
  /** The link that opens this building for anyone, or for another building by its address. */
  shareUrl: (id?: string) => string;
}

const Context = createContext<BuildingContext | null>(null);

let store: SavedBuildingsStore | undefined;

function savedBuildingsStore(): SavedBuildingsStore {
  if (!store) {
    let storage: Storage | null = null;
    try {
      storage = typeof window === "undefined" ? null : window.localStorage;
    } catch {
      storage = null; // Blocked by the browser's privacy settings.
    }
    store = createSavedBuildingsStore(storage);
  }
  return store;
}

const OVERVIEW_PATH = "/app/";

function describe(
  contractId: string,
  defaultId: string,
  invalidLink: boolean,
  saved: readonly string[],
  actions: Pick<BuildingContext, "save" | "remove">,
): BuildingContext {
  const isDefault = contractId === defaultId;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return {
    contractId,
    defaultId,
    isDefault,
    trusted: isTrustedBuilding(contractId, defaultId, saved),
    invalidLink,
    saved,
    ...actions,
    href: (path) => withBuilding(path, isDefault ? null : contractId),
    shareUrl: (id = contractId) => (id === defaultId ? `${origin}${OVERVIEW_PATH}` : buildingShareUrl(origin, OVERVIEW_PATH, id)),
  };
}

/**
 * Decides which building the app shows from the link. It reads the address bar, so it has to sit inside a
 * `Suspense` boundary: the app is exported as static files, and Next.js cannot prerender around it otherwise.
 */
export function BuildingProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const raw = params.get(BUILDING_PARAM);
  const fromLink = raw === null ? null : parseBuildingRef(raw);
  const defaultId = getConfig().treasuryContractId;

  const saved = useSyncExternalStore(
    (listener) => savedBuildingsStore().subscribe(listener),
    () => savedBuildingsStore().getSnapshot(),
    () => savedBuildingsStore().getServerSnapshot(),
  );
  const save = useCallback((id: string) => savedBuildingsStore().add(id), []);
  const remove = useCallback((id: string) => savedBuildingsStore().remove(id), []);

  const value = useMemo(
    () => describe(fromLink ?? defaultId, defaultId, raw !== null && fromLink === null, saved, { save, remove }),
    [fromLink, defaultId, raw, saved, save, remove],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

let fallback: BuildingContext | undefined;

/**
 * The building on screen. Outside the provider (the manual at `/hiw`) it is the configured building, so
 * pages that never choose a building keep working unchanged.
 */
export function useBuilding(): BuildingContext {
  const inContext = useContext(Context);
  if (inContext) return inContext;
  fallback ??= describe(getConfig().treasuryContractId, getConfig().treasuryContractId, false, [], {
    save: () => {},
    remove: () => {},
  });
  return fallback;
}

import { StrKey } from "@stellar/stellar-sdk";
import { describe, expect, it, vi } from "vitest";

import { BUILDING_PARAM, buildingShareUrl, isContractAddress, parseBuildingRef, withBuilding } from "./building-ref";
import {
  MAX_SAVED_BUILDINGS,
  SAVED_BUILDINGS_KEY,
  createSavedBuildingsStore,
  isTrustedBuilding,
  parseSavedBuildings,
  withSavedBuilding,
  withoutSavedBuilding,
  type KeyValueStorage,
} from "./saved-buildings";

const A = "CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP";
const B = "CBGQJOGHDW7POSGZGGBOAOJLZXLK5DWXJUVIISO7X7KZ5MBTXUNHIPYJ";
const ACCOUNT = "GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK";

/** A valid contract address that differs for each number: 32 bytes with the checksum the SDK adds. */
function contractNumber(n: number): string {
  return StrKey.encodeContract(Buffer.alloc(32, n + 1));
}

describe("isContractAddress", () => {
  it("accepts a contract address and rejects an account address, text and nothing", () => {
    expect(isContractAddress(A)).toBe(true);
    expect(isContractAddress(ACCOUNT)).toBe(false);
    expect(isContractAddress("")).toBe(false);
    expect(isContractAddress(A.slice(0, -1))).toBe(false);
    expect(isContractAddress(A.toLowerCase())).toBe(false);
  });
});

describe("parseBuildingRef", () => {
  it("accepts the address itself, with spaces around it", () => {
    expect(parseBuildingRef(A)).toBe(A);
    expect(parseBuildingRef(`  ${A}\n`)).toBe(A);
  });

  it("takes the address out of a Quintti link", () => {
    expect(parseBuildingRef(`https://quintti.example/app/?${BUILDING_PARAM}=${A}`)).toBe(A);
    expect(parseBuildingRef(`https://quintti.example/app/gastos/3/?${BUILDING_PARAM}=${A}&x=1`)).toBe(A);
    expect(parseBuildingRef(`http://localhost:3000/app?${BUILDING_PARAM}=${A}`)).toBe(A);
  });

  it("rejects what is not a building: other text, an account, a link without it or with a bad one", () => {
    for (const text of [
      "",
      "   ",
      "hola",
      ACCOUNT,
      `https://quintti.example/app/`,
      `https://quintti.example/app/?${BUILDING_PARAM}=`,
      `https://quintti.example/app/?${BUILDING_PARAM}=${ACCOUNT}`,
      `https://quintti.example/app/?${BUILDING_PARAM}=${A}x`,
      `javascript:alert(1)//?${BUILDING_PARAM}=${A}`,
      `ftp://example.org/?${BUILDING_PARAM}=${A}`,
    ]) {
      expect(parseBuildingRef(text), text).toBeNull();
    }
  });
});

describe("withBuilding", () => {
  it("leaves the path alone for the configured building", () => {
    expect(withBuilding("/app/gastos", null)).toBe("/app/gastos");
  });

  it("adds the address for any other building", () => {
    expect(withBuilding("/app/gastos", A)).toBe(`/app/gastos?${BUILDING_PARAM}=${A}`);
    expect(withBuilding("/app/gastos/3", B)).toBe(`/app/gastos/3?${BUILDING_PARAM}=${B}`);
  });

  it("uses & when the path already has a query", () => {
    expect(withBuilding("/app?x=1", A)).toBe(`/app?x=1&${BUILDING_PARAM}=${A}`);
  });

  it("round-trips through parseBuildingRef", () => {
    expect(parseBuildingRef(`https://quintti.example${withBuilding("/app/", A)}`)).toBe(A);
  });
});

describe("buildingShareUrl", () => {
  it("joins the site, the overview and the building", () => {
    expect(buildingShareUrl("https://quintti.example", "/app/", A)).toBe(
      `https://quintti.example/app/?${BUILDING_PARAM}=${A}`,
    );
  });
});

describe("parseSavedBuildings", () => {
  it("reads a list of contract addresses", () => {
    expect(parseSavedBuildings(JSON.stringify([A, B]))).toEqual([A, B]);
  });

  it("returns nothing for missing, broken or foreign data", () => {
    for (const raw of [null, "", "not json", "{}", '"text"', "42", "null"]) {
      expect(parseSavedBuildings(raw), String(raw)).toEqual([]);
    }
  });

  it("drops entries that are not contract addresses and repeated ones", () => {
    expect(parseSavedBuildings(JSON.stringify([A, 7, null, ACCOUNT, "x", A, { id: B }, B]))).toEqual([A, B]);
  });

  it("never returns more than the limit, and keeps the first ones", () => {
    const many = Array.from({ length: MAX_SAVED_BUILDINGS * 3 }, (_, n) => contractNumber(n));

    const result = parseSavedBuildings(JSON.stringify(many));

    expect(new Set(many).size).toBe(many.length);
    expect(result).toHaveLength(MAX_SAVED_BUILDINGS);
    expect(result).toEqual(many.slice(0, MAX_SAVED_BUILDINGS));
  });
});

describe("withSavedBuilding and withoutSavedBuilding", () => {
  it("adds a building once and keeps the order", () => {
    expect(withSavedBuilding([A], B)).toEqual([A, B]);
    expect(withSavedBuilding([A, B], A)).toEqual([A, B]);
  });

  it("refuses anything that is not a contract address", () => {
    expect(withSavedBuilding([A], ACCOUNT)).toEqual([A]);
    expect(withSavedBuilding([A], "hola")).toEqual([A]);
  });

  it("removes a building and ignores one that is not there", () => {
    expect(withoutSavedBuilding([A, B], A)).toEqual([B]);
    expect(withoutSavedBuilding([A], B)).toEqual([A]);
  });

  it("drops the oldest building once the limit is reached", () => {
    const full = Array.from({ length: MAX_SAVED_BUILDINGS }, (_, n) => contractNumber(n));
    const extra = contractNumber(MAX_SAVED_BUILDINGS);

    const result = withSavedBuilding(full, extra);

    expect(result).toHaveLength(MAX_SAVED_BUILDINGS);
    expect(result.at(-1)).toBe(extra);
    expect(result).not.toContain(full[0]);
  });

  it("does not change the list it was given", () => {
    const list = [A];
    withSavedBuilding(list, B);
    withoutSavedBuilding(list, A);
    expect(list).toEqual([A]);
  });
});

describe("isTrustedBuilding", () => {
  it("trusts the configured building and the saved ones, and nothing else", () => {
    expect(isTrustedBuilding(A, A, [])).toBe(true);
    expect(isTrustedBuilding(B, A, [B])).toBe(true);
    expect(isTrustedBuilding(B, A, [])).toBe(false);
    expect(isTrustedBuilding(B, null, [])).toBe(false);
  });
});

describe("createSavedBuildingsStore", () => {
  function memory(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
    const data = { ...initial };
    return { data, getItem: (key) => data[key] ?? null, setItem: (key, value) => void (data[key] = value) };
  }

  it("starts from what the storage holds", () => {
    const store = createSavedBuildingsStore(memory({ [SAVED_BUILDINGS_KEY]: JSON.stringify([A]) }));
    expect(store.getSnapshot()).toEqual([A]);
  });

  it("writes every change to the storage and tells the listeners", () => {
    const storage = memory();
    const store = createSavedBuildingsStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    store.add(A);
    store.add(B);
    store.remove(A);

    expect(store.getSnapshot()).toEqual([B]);
    expect(JSON.parse(storage.data[SAVED_BUILDINGS_KEY])).toEqual([B]);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("gives the same array until something changes, as useSyncExternalStore needs", () => {
    const store = createSavedBuildingsStore(memory());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    const before = store.getSnapshot();
    store.add(A);
    expect(store.getSnapshot()).not.toBe(before);
  });

  it("stops telling a listener that unsubscribed", () => {
    const store = createSavedBuildingsStore(memory());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    store.add(A);

    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps working in memory when the storage is blocked", () => {
    const blocked: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    const store = createSavedBuildingsStore(blocked);

    expect(store.getSnapshot()).toEqual([]);
    store.add(A);
    expect(store.getSnapshot()).toEqual([A]);
  });

  it("works without any storage, as on the server", () => {
    const store = createSavedBuildingsStore(null);
    expect(store.getServerSnapshot()).toEqual([]);
    store.add(A);
    expect(store.getSnapshot()).toEqual([A]);
  });
});

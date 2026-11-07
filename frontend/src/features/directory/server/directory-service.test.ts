import { describe, expect, it, vi } from "vitest";

import type { SupabaseRest } from "@/lib/supabase/rest";

import { createDirectoryService } from "./directory-service";

const CONTRACT = "CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA";

function fakeRest(tables: Record<string, unknown[]>): SupabaseRest & { select: ReturnType<typeof vi.fn> } {
  return {
    select: vi.fn(async (table: string) => tables[table] ?? []),
    insert: vi.fn(),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as SupabaseRest & { select: ReturnType<typeof vi.fn> };
}

describe("directory service", () => {
  it("returns the building and the names of known addresses", async () => {
    const rest = fakeRest({
      buildings: [{ name: "Torres del Parque", city: null, units: 40 }],
      people: [{ address: "GADMIN", display_name: "Marta", note: "Administradora" }],
    });

    const directory = await createDirectoryService(rest, CONTRACT).load();

    expect(directory).toEqual({
      configured: true,
      building: { name: "Torres del Parque", city: null, units: 40 },
      people: [{ address: "GADMIN", name: "Marta", note: "Administradora" }],
    });
  });

  it("asks only for the configured treasury", async () => {
    const rest = fakeRest({});

    await createDirectoryService(rest, CONTRACT).load();

    for (const call of rest.select.mock.calls) {
      expect(call[1]).toMatchObject({ contract_id: `eq.${CONTRACT}` });
    }
  });

  it("has no building when the team has not described it yet", async () => {
    const directory = await createDirectoryService(fakeRest({}), CONTRACT).load();

    expect(directory.building).toBeNull();
    expect(directory.people).toEqual([]);
  });
});

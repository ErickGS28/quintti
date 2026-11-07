import type { SupabaseRest } from "@/lib/supabase/rest";

import type { Directory } from "../types";

interface BuildingRow {
  name: string;
  city: string | null;
  units: number | null;
}

interface PersonRow {
  address: string;
  display_name: string;
  note: string | null;
}

/** Reads the building's profile and the names of known addresses for one treasury. */
export function createDirectoryService(rest: SupabaseRest, contractId: string) {
  return {
    async load(): Promise<Directory> {
      const [buildings, people] = await Promise.all([
        rest.select<BuildingRow>("buildings", { contract_id: `eq.${contractId}`, select: "name,city,units" }),
        rest.select<PersonRow>("people", {
          contract_id: `eq.${contractId}`,
          select: "address,display_name,note",
          order: "display_name.asc",
        }),
      ]);
      const [building] = buildings;
      return {
        configured: true,
        building: building ? { name: building.name, city: building.city, units: building.units } : null,
        people: people.map((person) => ({ address: person.address, name: person.display_name, note: person.note })),
      };
    },
  };
}

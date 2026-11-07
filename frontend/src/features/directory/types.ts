export interface BuildingProfile {
  name: string;
  city: string | null;
  units: number | null;
}

/** A human name for an address the building knows. Display only: never used to authorize anything. */
export interface Person {
  address: string;
  name: string;
  note: string | null;
}

export interface Directory {
  /** False when off-chain storage is not connected: screens then show addresses only. */
  configured: boolean;
  building: BuildingProfile | null;
  people: Person[];
}

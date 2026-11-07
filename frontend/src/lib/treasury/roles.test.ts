import { describe, expect, it } from "vitest";

import { permissionsOf, rolesOf, type Governance } from "./roles";

const governance: Governance = {
  assembly: "GASSEMBLY",
  administrator: "GADMIN",
  council: ["GCOUNCIL1", "GCOUNCIL2", "GCOUNCIL3"],
};

describe("roles", () => {
  it("gives no role to a disconnected visitor or a resident", () => {
    expect(rolesOf(null, governance)).toEqual([]);
    expect(rolesOf(undefined, governance)).toEqual([]);
    expect(rolesOf("GRESIDENT", governance)).toEqual([]);
  });

  it("recognizes each role", () => {
    expect(rolesOf("GASSEMBLY", governance)).toEqual(["assembly"]);
    expect(rolesOf("GADMIN", governance)).toEqual(["administrator"]);
    expect(rolesOf("GCOUNCIL2", governance)).toEqual(["council"]);
  });

  it("lists every role an address holds, in a stable order", () => {
    const shared = { ...governance, council: ["GASSEMBLY", "GCOUNCIL2"] };

    expect(rolesOf("GASSEMBLY", shared)).toEqual(["assembly", "council"]);
  });
});

describe("permissions", () => {
  it("lets a resident only read", () => {
    expect(permissionsOf([])).toEqual({
      canPropose: false,
      canApprove: false,
      canCancel: false,
      canManageRules: false,
    });
  });

  it("lets the administrator propose and cancel, never approve or change rules", () => {
    expect(permissionsOf(["administrator"])).toEqual({
      canPropose: true,
      canApprove: false,
      canCancel: true,
      canManageRules: false,
    });
  });

  it("lets the council only approve", () => {
    expect(permissionsOf(["council"])).toMatchObject({ canApprove: true, canPropose: false, canCancel: false });
  });

  it("lets the assembly change rules and cancel, never move funds", () => {
    expect(permissionsOf(["assembly"])).toEqual({
      canPropose: false,
      canApprove: false,
      canCancel: true,
      canManageRules: true,
    });
  });
});

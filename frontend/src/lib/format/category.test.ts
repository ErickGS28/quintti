import { describe, expect, it } from "vitest";

import { categoryLabel } from "./category";

describe("category label", () => {
  it("capitalizes the first letter", () => {
    expect(categoryLabel("mantenimiento")).toBe("Mantenimiento");
  });

  it("turns underscores into spaces", () => {
    expect(categoryLabel("areas_comunes")).toBe("Areas comunes");
    expect(categoryLabel("fondo__de_reserva")).toBe("Fondo de reserva");
  });

  it("keeps a symbol made only of underscores as it is", () => {
    expect(categoryLabel("__")).toBe("__");
  });
});

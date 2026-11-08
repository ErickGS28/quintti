import { describe, expect, it } from "vitest";

import { positionIn } from "./pointer";

describe("pointer position", () => {
  it("measures a pointer from the top-left corner of a box", () => {
    expect(positionIn({ left: 40, top: 100 }, { x: 140, y: 130 })).toEqual({ x: 100, y: 30 });
  });

  it("is negative when the pointer is above or left of the box", () => {
    expect(positionIn({ left: 40, top: 100 }, { x: 30, y: 90 })).toEqual({ x: -10, y: -10 });
  });
});

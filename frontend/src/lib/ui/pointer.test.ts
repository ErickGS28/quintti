import { describe, expect, it } from "vitest";

import { approach, frameFactor, isSettled, positionIn } from "./pointer";

describe("pointer follow", () => {
  it("covers the tuned share of the distance in one 60 Hz frame", () => {
    expect(frameFactor(0.2, 1000 / 60)).toBeCloseTo(0.2);
  });

  it("covers the same distance per second whatever the frame rate", () => {
    const at60 = frameFactor(0.2, 1000 / 60);
    const at120 = frameFactor(0.2, 1000 / 120);

    // Two frames at 120 Hz leave the same remainder as one frame at 60 Hz.
    expect((1 - at120) ** 2).toBeCloseTo(1 - at60);
  });

  it("does not move when no time has passed", () => {
    expect(frameFactor(0.2, 0)).toBe(0);
    expect(frameFactor(0.2, -5)).toBe(0);
  });

  it("moves part of the way to the target", () => {
    expect(approach({ x: 0, y: 0 }, { x: 100, y: -50 }, 0.25)).toEqual({ x: 25, y: -12.5 });
  });

  it("settles once it is within the tolerance on both axes", () => {
    expect(isSettled({ x: 10.05, y: 4.95 }, { x: 10, y: 5 })).toBe(true);
    expect(isSettled({ x: 10.5, y: 5 }, { x: 10, y: 5 })).toBe(false);
  });

  it("reaches the target after enough frames", () => {
    let point = { x: 0, y: 0 };
    const target = { x: 300, y: 200 };
    for (let frame = 0; frame < 120; frame++) point = approach(point, target, 0.2);

    expect(isSettled(point, target)).toBe(true);
  });

  it("measures a pointer from the top-left corner of a box", () => {
    expect(positionIn({ left: 40, top: 100 }, { x: 140, y: 130 })).toEqual({ x: 100, y: 30 });
  });
});

import { describe, expect, it } from "vitest";

import { midpoint, mixRgb, pruneTrail, segmentStyle, type TrailPoint } from "./trail";

const at = (time: number, x = 0): TrailPoint => ({ x, y: 0, time });

describe("cursor trail", () => {
  it("drops the points older than the lifetime and keeps the order", () => {
    const points = [at(0, 1), at(200, 2), at(390, 3), at(500, 4)];

    expect(pruneTrail(points, 600, 380).map((point) => point.x)).toEqual([3, 4]);
  });

  it("keeps only the newest points when there are too many", () => {
    const points = Array.from({ length: 10 }, (_, index) => at(1000, index));

    expect(pruneTrail(points, 1000, 380, 4).map((point) => point.x)).toEqual([6, 7, 8, 9]);
  });

  it("is empty once the pointer has been still for the whole lifetime", () => {
    expect(pruneTrail([at(0), at(10)], 1000)).toEqual([]);
  });

  it("mixes two colors and stays within them", () => {
    expect(mixRgb([0, 0, 0], [200, 100, 50], 0.5)).toEqual([100, 50, 25]);
    expect(mixRgb([0, 0, 0], [200, 100, 50], 2)).toEqual([200, 100, 50]);
    expect(mixRgb([0, 0, 0], [200, 100, 50], -1)).toEqual([0, 0, 0]);
  });

  it("is fullest next to the pointer and fades to nothing at the tail", () => {
    const head = segmentStyle(1, 0, 4);
    const middle = segmentStyle(0.5, 0, 4);
    const tail = segmentStyle(0, 0, 4);

    expect(head.width).toBe(4);
    expect(middle.width).toBe(2);
    expect(tail).toEqual({ width: 0, alpha: 0 });
    expect(head.alpha).toBeGreaterThan(middle.alpha);
  });

  it("fades as it ages", () => {
    expect(segmentStyle(1, 0.5, 4).width).toBe(2);
    expect(segmentStyle(1, 1, 4)).toEqual({ width: 0, alpha: 0 });
  });

  it("finds the point halfway between two others", () => {
    expect(midpoint({ x: 0, y: 10 }, { x: 20, y: 30 })).toEqual({ x: 10, y: 20 });
  });
});

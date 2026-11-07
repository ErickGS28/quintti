import type { Point } from "./pointer";

export interface TrailPoint extends Point {
  /** When the pointer was here, in milliseconds (the clock of `requestAnimationFrame`). */
  time: number;
}

export type Rgb = readonly [number, number, number];

/** How long a point of the trail stays on screen. Short, so the trail reads as motion, not as ink. */
export const TRAIL_LIFETIME_MS = 380;

/** Upper bound on stored points, so a fast flick never grows the work done per frame. */
export const TRAIL_MAX_POINTS = 40;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Keeps the points younger than `lifetime`, oldest first, and at most `max` of the newest. */
export function pruneTrail(
  points: readonly TrailPoint[],
  now: number,
  lifetime = TRAIL_LIFETIME_MS,
  max = TRAIL_MAX_POINTS,
): TrailPoint[] {
  const fresh = points.filter((point) => now - point.time < lifetime);
  return fresh.length > max ? fresh.slice(fresh.length - max) : fresh;
}

/** A color between `from` (amount 0) and `to` (amount 1), with whole channels. */
export function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  const t = clamp(amount);
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

/**
 * The look of one segment of the trail. `position` is 0 at the tail and 1 next to the pointer;
 * `age` is 0 for a fresh point and 1 for one about to vanish. The trail tapers to nothing at the
 * tail and as it ages, so it never ends in a hard edge.
 */
export function segmentStyle(position: number, age: number, maxWidth: number): { width: number; alpha: number } {
  const reach = clamp(position);
  const life = 1 - clamp(age);
  const strength = reach * life;
  return { width: maxWidth * strength, alpha: 0.9 * strength };
}

/** The point halfway between two others, used to draw the trail as a smooth curve. */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

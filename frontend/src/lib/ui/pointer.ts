export interface Point {
  x: number;
  y: number;
}

/**
 * Pointer effects run only with a mouse or a trackpad, and only when the person has not asked for
 * reduced motion. Touch screens and keyboard users keep the plain interface.
 */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Elements the cursor ring reacts to, because clicking them does something. */
export const INTERACTIVE_SELECTOR = "a, button, summary, label, select, [role='button']";

/** Duration of one frame at 60 frames per second, the rate the follow factors are tuned for. */
const FRAME_MS = 1000 / 60;

/**
 * The share of the remaining distance to cover in a frame that lasted `elapsedMs`, so the follow
 * feels the same on a 60 Hz and a 144 Hz screen. `perFrame` is the share for a 60 Hz frame.
 */
export function frameFactor(perFrame: number, elapsedMs: number): number {
  const frames = Math.max(0, elapsedMs) / FRAME_MS;
  return 1 - (1 - perFrame) ** frames;
}

/** Moves `current` part of the way to `target`. Repeated every frame, it gives an eased follow. */
export function approach(current: Point, target: Point, factor: number): Point {
  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  };
}

/** Whether `current` is close enough to `target` to stop animating. */
export function isSettled(current: Point, target: Point, tolerance = 0.1): boolean {
  return Math.abs(target.x - current.x) <= tolerance && Math.abs(target.y - current.y) <= tolerance;
}

/** Where a pointer is inside a box, in pixels from the box's top-left corner. */
export function positionIn(box: { left: number; top: number }, pointer: Point): Point {
  return { x: pointer.x - box.left, y: pointer.y - box.top };
}

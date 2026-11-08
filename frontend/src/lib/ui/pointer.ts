export interface Point {
  x: number;
  y: number;
}

/**
 * Pointer effects run only with a mouse or a trackpad, and only when the person has not asked for
 * reduced motion. Touch screens and keyboard users keep the plain interface.
 */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Where a pointer is inside a box, in pixels from the box's top-left corner. */
export function positionIn(box: { left: number; top: number }, pointer: Point): Point {
  return { x: pointer.x - box.left, y: pointer.y - box.top };
}

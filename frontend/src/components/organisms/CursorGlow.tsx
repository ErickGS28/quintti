"use client";

import { useEffect, useRef } from "react";

import { approach, FINE_POINTER_QUERY, frameFactor, isSettled, type Point } from "@/lib/ui/pointer";
import { useMediaQuery } from "@/lib/ui/use-media-query";

/** Share of the distance the glow covers per 60 Hz frame: it drifts behind the pointer. */
const GLOW_FOLLOW = 0.08;

/**
 * A soft lavender light that drifts behind the pointer. It blends with `screen`, so it lights the
 * dark chapters and is invisible on white ones. Nothing is drawn on the cursor itself.
 *
 * Only with a mouse or trackpad and when motion is allowed; otherwise it renders nothing. The
 * animation stops as soon as the light catches up, so an idle page costs nothing.
 */
export function CursorGlow() {
  const enabled = useMediaQuery(FINE_POINTER_QUERY);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!enabled || !glow) return;

    let target: Point | null = null;
    let at: Point = { x: 0, y: 0 };
    let frame = 0;
    let lastTime = 0;

    const place = (point: Point) => {
      glow.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    };

    const tick = (now: number) => {
      if (!target) {
        frame = 0;
        lastTime = 0;
        return;
      }
      const elapsed = lastTime ? now - lastTime : 1000 / 60;
      lastTime = now;
      at = approach(at, target, frameFactor(GLOW_FOLLOW, elapsed));
      place(at);
      if (isSettled(at, target, 0.5)) {
        frame = 0;
        lastTime = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = { x: event.clientX, y: event.clientY };
      if (!target) {
        // Appear where the pointer is instead of drifting in from a corner.
        at = point;
        place(point);
      }
      target = point;
      glow.dataset.visible = "true";
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      target = null;
      glow.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={glowRef} aria-hidden="true" className="cursor-glow" />;
}

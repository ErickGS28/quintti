"use client";

import { useEffect, useRef } from "react";

import {
  approach,
  FINE_POINTER_QUERY,
  frameFactor,
  INTERACTIVE_SELECTOR,
  isSettled,
  type Point,
} from "@/lib/ui/pointer";
import { useMediaQuery } from "@/lib/ui/use-media-query";

/** Share of the distance the ring covers per 60 Hz frame: close behind the pointer. */
const RING_FOLLOW = 0.24;
/** The halo trails further behind, which gives the movement its softness. */
const HALO_FOLLOW = 0.075;

function place(element: HTMLElement, point: Point) {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
}

/**
 * A thin ring that follows the pointer with a short, eased delay, and a soft halo of light that
 * trails behind it. The ring opens up and turns coral over anything clickable and tightens on press.
 * The system cursor stays visible, so precision and text selection are unchanged.
 *
 * Only with a mouse or trackpad and when motion is allowed; otherwise it renders nothing. The
 * animation stops as soon as the ring catches up, so an idle page costs nothing.
 */
export function CursorFollower() {
  const enabled = useMediaQuery(FINE_POINTER_QUERY);
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const halo = haloRef.current;
    if (!enabled || !ring || !halo) return;

    let target: Point | null = null;
    let ringAt: Point = { x: 0, y: 0 };
    let haloAt: Point = { x: 0, y: 0 };
    let frame = 0;
    let lastTime = 0;

    const tick = (now: number) => {
      if (!target) {
        frame = 0;
        lastTime = 0;
        return;
      }
      const elapsed = lastTime ? now - lastTime : 1000 / 60;
      lastTime = now;
      ringAt = approach(ringAt, target, frameFactor(RING_FOLLOW, elapsed));
      haloAt = approach(haloAt, target, frameFactor(HALO_FOLLOW, elapsed));
      place(ring, ringAt);
      place(halo, haloAt);

      if (isSettled(ringAt, target) && isSettled(haloAt, target, 0.5)) {
        frame = 0;
        lastTime = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const setVisible = (visible: boolean) => {
      ring.dataset.visible = String(visible);
      halo.dataset.visible = String(visible);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const point = { x: event.clientX, y: event.clientY };
      if (!target) {
        // Appear where the pointer is instead of flying in from a corner.
        ringAt = point;
        haloAt = point;
        place(ring, point);
        place(halo, point);
      }
      target = point;
      setVisible(true);
      const element = event.target instanceof Element ? event.target : null;
      ring.dataset.hover = String(Boolean(element?.closest(INTERACTIVE_SELECTOR)));
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      target = null;
      setVisible(false);
    };
    const onDown = () => {
      ring.dataset.press = "true";
    };
    const onUp = () => {
      ring.dataset.press = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={haloRef} aria-hidden="true" className="cursor-halo" />
      <div ref={ringRef} aria-hidden="true" className="cursor-ring">
        <span />
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";

import { FINE_POINTER_QUERY, positionIn } from "@/lib/ui/pointer";
import { useMediaQuery } from "@/lib/ui/use-media-query";

/**
 * Lights the card under the pointer: it writes the pointer's position into the card's `--mx` and
 * `--my` and marks it `data-lit`, which `.spotlight` in `globals.css` turns into a soft light and a
 * lit edge. One listener serves every card marked `data-spotlight`, at most once per frame.
 * Renders nothing.
 */
export function SpotlightTracker() {
  const enabled = useMediaQuery(FINE_POINTER_QUERY);

  useEffect(() => {
    if (!enabled) return;

    let lit: HTMLElement | null = null;
    let latest: PointerEvent | null = null;
    let frame = 0;

    const dim = () => {
      if (lit) lit.dataset.lit = "false";
      lit = null;
    };

    const apply = () => {
      frame = 0;
      const event = latest;
      if (!event) return;
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spotlight]") : null;
      if (lit !== card) dim();
      if (!card) return;
      const { x, y } = positionIn(card.getBoundingClientRect(), { x: event.clientX, y: event.clientY });
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      card.dataset.lit = "true";
      lit = card;
    };

    const onMove = (event: PointerEvent) => {
      latest = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) dim();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      dim();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [enabled]);

  return null;
}

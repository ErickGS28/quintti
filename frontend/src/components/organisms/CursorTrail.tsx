"use client";

import { useEffect, useRef } from "react";

import { approach, FINE_POINTER_QUERY, frameFactor, isSettled, type Point } from "@/lib/ui/pointer";
import {
  midpoint,
  mixRgb,
  pruneTrail,
  segmentStyle,
  TRAIL_LIFETIME_MS,
  type Rgb,
  type TrailPoint,
} from "@/lib/ui/trail";
import { useMediaQuery } from "@/lib/ui/use-media-query";

/** The trail goes from coral at its tail to lavender next to the pointer, like a hummingbird's sheen. */
const TAIL_COLOR: Rgb = [235, 95, 122];
const HEAD_COLOR: Rgb = [166, 119, 202];
/** Thickest part of the trail, in CSS pixels. */
const MAX_WIDTH = 3.5;
/** Share of the distance the halo covers per 60 Hz frame: it trails well behind the pointer. */
const HALO_FOLLOW = 0.075;

function fitToScreen(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  const context = canvas.getContext("2d");
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  return context;
}

function drawTrail(context: CanvasRenderingContext2D, points: TrailPoint[], now: number) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowBlur = 10;
  context.shadowColor = "rgb(166 119 202 / 0.55)";

  const last = points.length - 1;
  for (let index = 1; index <= last; index++) {
    const from = points[index - 1];
    const to = points[index];
    const position = index / last;
    const { width, alpha } = segmentStyle(position, (now - to.time) / TRAIL_LIFETIME_MS, MAX_WIDTH);
    if (alpha < 0.01) continue;

    const [red, green, blue] = mixRgb(TAIL_COLOR, HEAD_COLOR, position);
    context.strokeStyle = `rgb(${red} ${green} ${blue} / ${alpha})`;
    context.lineWidth = width;
    context.beginPath();
    // A curve through the midpoints keeps the trail smooth even when the pointer moves in jumps.
    const start = midpoint(points[index - 2] ?? from, from);
    const end = index === last ? to : midpoint(from, to);
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(from.x, from.y, end.x, end.y);
    context.stroke();
  }
}

/**
 * A thin trail of light behind the pointer, coral fading into lavender, that vanishes in a fraction
 * of a second, plus a soft halo that lights the dark chapters. The system cursor stays as it is.
 *
 * Only with a mouse or trackpad and when motion is allowed; otherwise it renders nothing. It draws
 * only while the pointer moves and stops once the trail has faded, so an idle page costs nothing.
 */
export function CursorTrail() {
  const enabled = useMediaQuery(FINE_POINTER_QUERY);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const halo = haloRef.current;
    if (!enabled || !canvas || !halo) return;

    let context = fitToScreen(canvas);
    let points: TrailPoint[] = [];
    let target: Point | null = null;
    let haloAt: Point = { x: 0, y: 0 };
    let frame = 0;
    let lastTime = 0;

    const tick = (now: number) => {
      const elapsed = lastTime ? now - lastTime : 1000 / 60;
      lastTime = now;
      points = pruneTrail(points, now);
      if (context) drawTrail(context, points, now);

      if (target) {
        haloAt = approach(haloAt, target, frameFactor(HALO_FOLLOW, elapsed));
        halo.style.transform = `translate3d(${haloAt.x}px, ${haloAt.y}px, 0)`;
      }

      const haloResting = !target || isSettled(haloAt, target, 0.5);
      if (points.length === 0 && haloResting) {
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
        haloAt = point;
        halo.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      }
      target = point;
      halo.dataset.visible = "true";
      points.push({ ...point, time: performance.now() });
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      target = null;
      halo.dataset.visible = "false";
    };

    const onResize = () => {
      context = fitToScreen(canvas);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={haloRef} aria-hidden="true" className="cursor-halo" />
      <canvas ref={canvasRef} aria-hidden="true" className="cursor-trail" />
    </>
  );
}

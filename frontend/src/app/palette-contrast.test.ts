import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Checks the text and background pairs the interface uses against the WCAG AA
 * minimum (4.5:1 for normal text). The colors are read from `globals.css`, the
 * single source of truth, so changing a token cannot silently break contrast.
 */
const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");

function token(name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`).exec(css);
  if (!match) throw new Error(`Token --${name} is not a hex color in globals.css`);
  return match[1];
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const AA = 4.5;

// [text token, background token]
const TEXT_PAIRS: Array<[string, string]> = [
  ["ink", "canvas"],
  ["ink", "mist"],
  ["ink", "periwinkle-soft"],
  ["ink", "coral-soft"],
  ["ink-soft", "canvas"],
  ["ink-soft", "mist"],
  ["ink-faint", "canvas"],
  ["ink-faint", "mist"],
  ["royal", "canvas"],
  ["royal", "mist"],
  ["royal", "royal-soft"],
  ["royal", "periwinkle-soft"],
  ["royal-strong", "royal-soft"],
  ["on-royal", "royal"],
  ["on-royal", "royal-strong"],
  ["wine", "canvas"],
  ["wine", "mist"],
  ["wine", "wine-soft"],
  ["wine", "coral-soft"],
  ["on-coral", "coral"],
  // The menu glass, the hero and the footer sit on night.
  ["canvas", "night"],
  ["periwinkle-soft", "night"],
  ["periwinkle", "night"],
  ["coral", "night"],
];

describe("palette contrast", () => {
  it.each(TEXT_PAIRS)("%s on %s reaches 4.5:1", (foreground, background) => {
    expect(contrast(token(foreground), token(background))).toBeGreaterThanOrEqual(AA);
  });

  it("keeps the decorative colors out of text: lavender and coral on white are below 4.5:1", () => {
    expect(contrast(token("lavender"), token("canvas"))).toBeLessThan(AA);
    expect(contrast(token("coral"), token("canvas"))).toBeLessThan(AA);
  });

  it("uses the five brand colors unchanged", () => {
    expect(token("royal")).toBe("#4525a2");
    expect(token("lavender")).toBe("#a677ca");
    expect(token("periwinkle")).toBe("#aba7e3");
    expect(token("wine")).toBe("#890c50");
    expect(token("coral")).toBe("#eb5f7a");
  });
});

/** Reads a `.tone-*` block of `globals.css` into a map from variable name to the token it points at. */
function tones(): Map<string, Record<string, string>> {
  const result = new Map<string, Record<string, string>>();
  for (const block of css.matchAll(/\.tone-([a-z]+)\s*\{([^}]*)\}/g)) {
    const variables: Record<string, string> = {};
    for (const variable of block[2].matchAll(/--(slide-[a-z]+(?:-[a-z]+)?):\s*var\(--([a-z-]+)\)/g)) {
      variables[variable[1]] = variable[2];
    }
    result.set(block[1], variables);
  }
  return result;
}

const LARGE_TEXT = 3;

describe("chapter tones", () => {
  const all = tones();

  it("defines the seven tones the landing page uses", () => {
    expect([...all.keys()].sort()).toEqual(["canvas", "finale", "mist", "night", "periwinkle", "royal", "wine"]);
  });

  for (const [name, variables] of all) {
    // A tone paints a gradient from one token to another, so each text color must read on both ends.
    describe(name, () => {
      const surfaces = [variables["slide-from"], variables["slide-to"]];

      it.each(surfaces)("body text and muted text reach 4.5:1 on %s", (surface) => {
        expect(contrast(token(variables["slide-text"]), token(surface))).toBeGreaterThanOrEqual(AA);
        expect(contrast(token(variables["slide-muted"]), token(surface))).toBeGreaterThanOrEqual(AA);
      });

      it.each(surfaces)("the title reaches 4.5:1 on %s", (surface) => {
        expect(contrast(token(variables["slide-title"]), token(surface))).toBeGreaterThanOrEqual(AA);
      });

      // The accent colors the large sentence under each title, so the large-text minimum applies.
      it.each(surfaces)("the accent reaches 3:1 on %s", (surface) => {
        expect(contrast(token(variables["slide-accent"]), token(surface))).toBeGreaterThanOrEqual(LARGE_TEXT);
      });
    });
  }

  it("keeps the light text colors on white cards and on the dark footer", () => {
    expect(contrast(token("wine"), token("canvas"))).toBeGreaterThanOrEqual(AA);
    expect(contrast(token("periwinkle"), token("ink"))).toBeGreaterThanOrEqual(AA);
    expect(contrast(token("periwinkle-soft"), token("ink"))).toBeGreaterThanOrEqual(AA);
    expect(contrast(token("wine-soft"), token("wine"))).toBeGreaterThanOrEqual(AA);
  });
});

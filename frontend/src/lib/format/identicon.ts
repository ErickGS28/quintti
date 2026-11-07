/** Two hues and an angle that paint a small gradient avatar for an address. */
export interface Identicon {
  from: number;
  to: number;
  angle: number;
}

/** FNV-1a: a small, stable hash, so the same address always gets the same avatar. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/**
 * The palette's purple-to-coral range, in degrees of hue: avatars stay on brand and still tell
 * addresses apart at a glance.
 */
const HUE_START = 250;
const HUE_RANGE = 110;

/** A deterministic avatar for a Stellar address. Decorative: the address is always shown as text too. */
export function identiconFor(address: string): Identicon {
  const value = hash(address);
  const from = (HUE_START + (value % HUE_RANGE)) % 360;
  const to = (from + 30 + ((value >>> 8) % 50)) % 360;
  const angle = (value >>> 16) % 360;
  return { from, to, angle };
}

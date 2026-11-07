/**
 * Shortens a Stellar address for display, keeping both ends so it stays
 * recognizable: `GBWM…6LAK`. Short values are returned unchanged.
 */
export function shortenAddress(address: string, head = 4, tail = 4): string {
  if (address.length <= head + tail + 1) {
    return address;
  }
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

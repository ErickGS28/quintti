/**
 * A budget category as people read it. The contract stores a Soroban symbol such as
 * `mantenimiento` or `areas_comunes`; this shows "Mantenimiento" and "Areas comunes".
 */
export function categoryLabel(symbol: string): string {
  const words = symbol.replace(/_+/g, " ").trim();
  if (!words) return symbol;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept up to date when it changes. The server and the first render
 * in the browser say `false`, so client-only effects mount after hydration without a mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

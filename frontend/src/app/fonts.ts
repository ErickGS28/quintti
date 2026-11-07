import localFont from "next/font/local";

/**
 * Geist and Geist Mono (SIL Open Font License, see `fonts/OFL.txt`), served from this repository.
 * The files are the Latin variable subsets, which cover Spanish. Nothing is fetched at build time
 * or at run time, so the build works offline and the browser never contacts a font service.
 */
export const geist = localFont({
  src: "./fonts/geist-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist",
});

/** Monospaced companion for labels, figures and fingerprints. */
export const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist-mono",
});

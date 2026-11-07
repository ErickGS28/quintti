import type { SwkAppTheme } from "@creit.tech/stellar-wallets-kit/types";

/**
 * The wallet picker of Stellar Wallets Kit in Quintti's colors and type, so connecting a wallet
 * feels like part of the app. Values mirror the tokens in `app/globals.css`.
 */
export const QUINTTI_WALLET_THEME: SwkAppTheme = {
  background: "#ffffff",
  "background-secondary": "#f6f3fc",
  "foreground-strong": "#1d1240",
  foreground: "#1d1240",
  "foreground-secondary": "#4a4270",
  primary: "#4525a2",
  "primary-foreground": "#ffffff",
  transparent: "rgba(0, 0, 0, 0)",
  lighter: "#ffffff",
  light: "#f6f3fc",
  "light-gray": "#eceafa",
  gray: "#5c5486",
  danger: "#890c50",
  border: "rgba(69, 37, 162, 0.14)",
  shadow: "0 24px 48px -16px rgba(69, 37, 162, 0.28), 0 2px 6px rgba(69, 37, 162, 0.06)",
  "border-radius": "1rem",
  "font-family": "var(--font-geist), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
};

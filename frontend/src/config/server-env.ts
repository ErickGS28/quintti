import { ConfigError } from "./env";

/**
 * Settings that only the server reads. They hold a secret (the Supabase secret key), so they are
 * never prefixed with `NEXT_PUBLIC_` and never reach the browser.
 */
export interface ServerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  /** Storage bucket for invoice files. */
  invoiceBucket: string;
}

export interface RawServerConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  invoiceBucket?: string;
}

export const DEFAULT_INVOICE_BUCKET = "invoices";

/**
 * Validates the off-chain storage settings. Returns `null` when none is set: the app then works
 * from the contract alone. Setting only one of them is a mistake and fails loudly.
 *
 * Errors: `ConfigError`.
 */
export function parseServerConfig(raw: RawServerConfig): ServerConfig | null {
  const supabaseUrl = raw.supabaseUrl?.trim() ?? "";
  const supabaseKey = raw.supabaseKey?.trim() ?? "";
  if (!supabaseUrl && !supabaseKey) return null;

  const issues: string[] = [];
  if (!supabaseUrl) issues.push("SUPABASE_URL is required when SUPABASE_SECRET_KEY is set");
  if (!supabaseKey) issues.push("SUPABASE_SECRET_KEY is required when SUPABASE_URL is set");
  if (supabaseUrl) {
    try {
      const { protocol } = new URL(supabaseUrl);
      if (protocol !== "https:" && protocol !== "http:") issues.push("SUPABASE_URL must be an http(s) URL");
    } catch {
      issues.push("SUPABASE_URL must be an http(s) URL");
    }
  }
  const invoiceBucket = raw.invoiceBucket?.trim() || DEFAULT_INVOICE_BUCKET;
  if (!/^[a-z0-9][a-z0-9_-]{1,62}$/.test(invoiceBucket)) {
    issues.push("SUPABASE_INVOICE_BUCKET must be lowercase letters, digits, hyphens or underscores");
  }
  if (issues.length > 0) throw new ConfigError(issues);

  return { supabaseUrl: supabaseUrl.replace(/\/+$/, ""), supabaseKey, invoiceBucket };
}

/** The server's off-chain storage settings, or `null` when off-chain storage is not connected. */
export function getServerConfig(): ServerConfig | null {
  return parseServerConfig({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SECRET_KEY,
    invoiceBucket: process.env.SUPABASE_INVOICE_BUCKET,
  });
}

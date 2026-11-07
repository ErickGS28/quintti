// Server-only entry of the feature, for route handlers. It reads the secret Supabase key, so it is
// never imported by components or hooks (an ESLint rule enforces it).

import { getConfig } from "@/config/env";
import { getServerConfig } from "@/config/server-env";
import { createSupabaseRest } from "@/lib/supabase/rest";

import { createDirectoryService } from "./server/directory-service";
import type { Directory } from "./types";

/** What the API answers when off-chain storage is not connected. */
export const EMPTY_DIRECTORY: Directory = { configured: false, building: null, people: [] };

/** The directory service for the configured treasury, or `null` when storage is off. */
export function serverDirectoryService() {
  const server = getServerConfig();
  if (!server) return null;
  const rest = createSupabaseRest({ url: server.supabaseUrl, key: server.supabaseKey });
  return createDirectoryService(rest, getConfig().treasuryContractId);
}

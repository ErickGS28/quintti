// Server-only entry of the feature, for route handlers. It reads the secret Supabase key, so it is
// never imported by components or hooks (an ESLint rule enforces it).

import { getConfig } from "@/config/env";
import { getServerConfig } from "@/config/server-env";
import { createSupabaseRest } from "@/lib/supabase/rest";

import { DetailsError, STATUS_BY_CODE } from "./server/details-error";
import { createDetailsService, type DetailsService } from "./server/details-service";
import { onChainInvoiceHash } from "./server/on-chain-invoice";
import { createSupabaseDetailsStore } from "./server/supabase-details-store";

export { parseDetailsForm, parseExpenseId } from "./server/validation";
export { DetailsError };

/** The details service wired to Supabase and the configured treasury, or `null` when storage is off. */
export function serverDetailsService(): DetailsService | null {
  const server = getServerConfig();
  if (!server) return null;
  const config = getConfig();
  const rest = createSupabaseRest({ url: server.supabaseUrl, key: server.supabaseKey });
  return createDetailsService({
    store: createSupabaseDetailsStore(rest, config.treasuryContractId, server.invoiceBucket),
    invoiceHashOnChain: onChainInvoiceHash(config),
    contractId: config.treasuryContractId,
  });
}

/** The JSON answer for a failure: a stable code for the client, and the right HTTP status. */
export function detailsErrorResponse(error: unknown): Response {
  if (error instanceof DetailsError) {
    return Response.json(
      { error: error.code, message: error.message, field: error.field },
      { status: STATUS_BY_CODE[error.code] },
    );
  }
  console.error("Unexpected error in the details API", error);
  return Response.json({ error: "upstream", message: "Unexpected error" }, { status: 502 });
}

export const NOT_CONFIGURED = { error: "not-configured", message: "Off-chain storage is not connected" } as const;

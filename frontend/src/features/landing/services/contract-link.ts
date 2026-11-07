import { getConfig } from "@/config/env";
import { contractUrl } from "@/lib/stellar/explorer";

/**
 * Link to the demo treasury in the block explorer, or `null` when the app is not configured with
 * one. The landing page must work without any configuration, so a missing or invalid setting is
 * not an error here.
 */
export function demoContractUrl(): string | null {
  try {
    const config = getConfig();
    return contractUrl(config, config.treasuryContractId);
  } catch {
    return null;
  }
}

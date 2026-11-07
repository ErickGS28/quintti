import { CALL_OPTIONS, type WriteReceipt } from "@/lib/stellar/transaction-service";
import { executeWrite, type WriteDependencies } from "@/lib/treasury/execute-write";
import {
  validateAddress,
  validateAmount,
  validateCategory,
  validateWholeNumber,
} from "@/lib/treasury/input";

/**
 * The assembly's actions: budget, approved vendors, administrator and council.
 * Each one is signed by the connected wallet, and the contract only accepts
 * them from the assembly account.
 */
export function createGovernanceService(deps: WriteDependencies) {
  return {
    /** Creates a budget line or changes its limit (in base units). */
    async setBudget(input: { category: string; limit: bigint }): Promise<WriteReceipt<void>> {
      const category = validateCategory(input.category);
      const limit = validateAmount(input.limit, "limit");
      return executeWrite(deps, (client) => client.set_budget({ category, limit }, CALL_OPTIONS));
    },

    /** Approves or removes a vendor. */
    async setVendor(input: { vendor: string; allowed: boolean }): Promise<WriteReceipt<void>> {
      const vendor = validateAddress(input.vendor, "vendor");
      return executeWrite(deps, (client) =>
        client.set_vendor({ vendor, allowed: input.allowed }, CALL_OPTIONS),
      );
    },

    /** Replaces the administrator. */
    async setAdministrator(administrator: string): Promise<WriteReceipt<void>> {
      const address = validateAddress(administrator, "administrator");
      return executeWrite(deps, (client) =>
        client.set_administrator({ administrator: address }, CALL_OPTIONS),
      );
    },

    /** Replaces the council and the number of approvals needed to pay. */
    async rotateCouncil(input: { council: string[]; threshold: number }): Promise<WriteReceipt<void>> {
      const council = input.council.map((member) => validateAddress(member, "council"));
      const threshold = validateWholeNumber(input.threshold, "threshold");
      return executeWrite(deps, (client) => client.rotate_council({ council, threshold }, CALL_OPTIONS));
    },
  };
}

export type GovernanceService = ReturnType<typeof createGovernanceService>;

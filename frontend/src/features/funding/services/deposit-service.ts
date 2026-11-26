import { CALL_OPTIONS, type WriteReceipt } from "@/lib/stellar/transaction-service";
import { executeWrite, type WriteDependencies } from "@/lib/treasury/execute-write";
import { validateAmount } from "@/lib/treasury/input";

/**
 * Putting money into the treasury. Anyone with a wallet can do it: the contract takes the tokens from the
 * connected account and records who paid, and asks for that account's signature only.
 */
export function createDepositService(deps: WriteDependencies) {
  return {
    /**
     * Pays `amount` (in the token's base units) from the connected account into the treasury.
     *
     * Errors: `AppError` of kind `invalid-input` before anything is sent. If the account holds too little the
     * token rejects the call at simulation, which arrives as `other-contract`, before any signature is asked.
     */
    async deposit(input: { amount: bigint }): Promise<WriteReceipt<void>> {
      const amount = validateAmount(input.amount);
      return executeWrite(deps, (client, from) => client.deposit({ from, amount }, CALL_OPTIONS));
    },
  };
}

export type DepositService = ReturnType<typeof createDepositService>;

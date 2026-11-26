import { describe, expect, it, vi } from "vitest";

import type { Client } from "@/contracts/vault-generated";
import { AppError } from "@/lib/errors/app-error";
import {
  TEST_ADDRESS,
  confirmedTransaction,
  errResult,
  fakeWallet,
  plainReadOf,
  testConfig,
} from "@/test-support/fakes";

import { createVaultService } from "./vault-service";

const VAULT = "CCWAQ2MNYYFWYSTJAQMRI45CYJTGEBLY4YQ2NZOMLE663TSB64CBTORL";
const TREASURY_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

function setup(client: Partial<Record<keyof Client, unknown>>, walletOptions?: Parameters<typeof fakeWallet>[0]) {
  const wallet = fakeWallet(walletOptions);
  const createClient = vi.fn().mockReturnValue(client as unknown as Client);
  const service = createVaultService({ config: testConfig, contractId: VAULT, wallet, createClient });
  return { wallet, createClient, service };
}

/** A claim whose simulation was refused by `raisedBy` with `code`, as the SDK reports it. */
function refusedClaim(code: number, events: unknown[] = []) {
  return {
    simulation: { error: `HostError: Error(Contract, #${code})`, events, id: "1", latestLedger: 1, _parsed: true },
    options: { contractId: VAULT },
    signAndSend: vi.fn(),
  };
}

describe("claim", () => {
  it("pays the connected account and returns the receipt with the amount", async () => {
    const claim = vi.fn().mockResolvedValue(confirmedTransaction(555_500_000n, "claimed"));
    const { service, createClient } = setup({ claim });

    const receipt = await service.claim("Ship It");

    expect(claim.mock.calls[0][0]).toEqual({ claimer: TEST_ADDRESS, code: "Ship It" });
    expect(createClient).toHaveBeenCalledWith(testConfig, VAULT, expect.objectContaining({ address: TEST_ADDRESS }));
    expect(receipt).toEqual({
      hash: "claimed",
      explorerUrl: "https://stellar.expert/explorer/testnet/tx/claimed",
      value: 555_500_000n,
    });
  });

  it("sends the code without the spaces around it", async () => {
    const claim = vi.fn().mockResolvedValue(confirmedTransaction(1n));
    const { service } = setup({ claim });

    await service.claim("  Ship It  ");

    expect(claim.mock.calls[0][0].code).toBe("Ship It");
  });

  it("rejects an empty code before touching the wallet or the network", async () => {
    const claim = vi.fn();
    const { service, wallet, createClient } = setup({ claim });

    await expect(service.claim("   ")).rejects.toMatchObject({ kind: "invalid-input", field: "code" });
    expect(wallet.getAddress).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(claim).not.toHaveBeenCalled();
  });

  it("asks for a wallet when none is connected", async () => {
    const claim = vi.fn();
    const { service } = setup({ claim }, { address: null });

    await expect(service.claim("Ship It")).rejects.toMatchObject({ kind: "wallet-unavailable" });
    expect(claim).not.toHaveBeenCalled();
  });

  it("refuses a wallet on another network", async () => {
    const claim = vi.fn();
    const { service } = setup({ claim }, { networkPassphrase: "Public Global Stellar Network ; September 2015" });

    await expect(service.claim("Ship It")).rejects.toMatchObject({ kind: "wallet-network" });
    expect(claim).not.toHaveBeenCalled();
  });

  it("names a wrong code with the vault's table and never asks for a signature", async () => {
    const refused = refusedClaim(1);
    const { service } = setup({ claim: vi.fn().mockResolvedValue(refused) });

    // #1 is NotInitialized in the treasury's table. Here it must be WrongCode.
    await expect(service.claim("nope")).rejects.toMatchObject({ kind: "contract", contractError: "WrongCode" });
    expect(refused.signAndSend).not.toHaveBeenCalled();
  });

  it("names a second claim and an empty vault", async () => {
    const claimed = setup({ claim: vi.fn().mockResolvedValue(refusedClaim(2)) });
    const empty = setup({ claim: vi.fn().mockResolvedValue(refusedClaim(3)) });

    await expect(claimed.service.claim("Ship It")).rejects.toMatchObject({ contractError: "AlreadyClaimed" });
    await expect(empty.service.claim("Ship It")).rejects.toMatchObject({ contractError: "VaultEmpty" });
  });

  it("names a rejection that arrives with the result of the sent transaction", async () => {
    const sent = { sendTransactionResponse: { hash: "h" }, result: errResult("AlreadyClaimed") };
    const claim = vi.fn().mockResolvedValue({ simulation: undefined, signAndSend: vi.fn().mockResolvedValue(sent) });
    const { service } = setup({ claim });

    await expect(service.claim("Ship It")).rejects.toMatchObject({ kind: "contract", contractError: "AlreadyClaimed" });
  });

  it("reports a closed wallet prompt as a normal outcome", async () => {
    const tx = confirmedTransaction(1n);
    (tx.signAndSend as ReturnType<typeof vi.fn>).mockRejectedValue(new AppError("wallet-rejected", "closed"));
    const { service } = setup({ claim: vi.fn().mockResolvedValue(tx) });

    await expect(service.claim("Ship It")).rejects.toMatchObject({ kind: "wallet-rejected" });
  });

  it("does not name a code the vault does not have", async () => {
    // The vault has four errors. A code above them (the token's own #10, say) is not given one of their names.
    const { service } = setup({ claim: vi.fn().mockResolvedValue(refusedClaim(10)) });

    const error = await service.claim("Ship It").catch((caught: AppError) => caught);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).contractError).toBeUndefined();
  });
});

describe("read", () => {
  it("returns what the vault holds, pays and has paid", async () => {
    const client = {
      get_balance: vi.fn().mockResolvedValue(plainReadOf(55_550_000_000n)),
      get_config: vi.fn().mockResolvedValue(plainReadOf({ payout: 555_500_000n, token: TREASURY_TOKEN, code_hash: Buffer.alloc(32) })),
      get_claims: vi.fn().mockResolvedValue(plainReadOf(3)),
    };
    const { service, createClient } = setup(client);

    await expect(service.read()).resolves.toEqual({ balance: 55_550_000_000n, payout: 555_500_000n, claims: 3 });
    expect(createClient).toHaveBeenCalledWith(testConfig, VAULT);
  });

  it("does not expose the hash of the code to the screens", async () => {
    const client = {
      get_balance: vi.fn().mockResolvedValue(plainReadOf(1n)),
      get_config: vi.fn().mockResolvedValue(plainReadOf({ payout: 1n, token: TREASURY_TOKEN, code_hash: Buffer.alloc(32, 7) })),
      get_claims: vi.fn().mockResolvedValue(plainReadOf(0)),
    };
    const { service } = setup(client);

    expect(Object.keys(await service.read()).sort()).toEqual(["balance", "claims", "payout"]);
  });

  it("wraps a failed read in an AppError", async () => {
    const failing = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const { service } = setup({ get_balance: failing, get_config: failing, get_claims: failing });

    await expect(service.read()).rejects.toMatchObject({ kind: "network" });
  });
});

describe("hasClaimed", () => {
  it("asks the vault about the account", async () => {
    const has_claimed = vi.fn().mockResolvedValue(plainReadOf(true));
    const { service } = setup({ has_claimed });

    await expect(service.hasClaimed(TEST_ADDRESS)).resolves.toBe(true);
    expect(has_claimed.mock.calls[0][0]).toEqual({ account: TEST_ADDRESS });
  });
});

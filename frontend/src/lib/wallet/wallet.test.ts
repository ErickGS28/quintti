import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors/app-error";

import { assertWalletNetwork } from "./network-check";
import type { WalletAdapter } from "./wallet-adapter";
import { toWalletError } from "./wallet-errors";
import { createWalletsKitAdapter, type WalletsKit } from "./wallets-kit-adapter";

const TESTNET = "Test SDF Network ; September 2015";
const ADDRESS = "GBWMA42DA6PJ6V4PQITB4APQGO5BGBMVV4ZQD245DKAEDVKFQZBD6LAK";

function fakeKit(overrides: Partial<WalletsKit> = {}): WalletsKit {
  return {
    authModal: vi.fn().mockResolvedValue({ address: ADDRESS }),
    getAddress: vi.fn().mockResolvedValue({ address: ADDRESS }),
    getNetwork: vi.fn().mockResolvedValue({ network: "TESTNET", networkPassphrase: TESTNET }),
    signTransaction: vi.fn().mockResolvedValue({ signedTxXdr: "SIGNED", signerAddress: ADDRESS }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("toWalletError", () => {
  it("treats the wording wallets use for a closed prompt as a rejection", () => {
    for (const message of ["User declined access", "Request rejected", "The user closed the modal", "Cancelled by user"]) {
      expect(toWalletError(new Error(message)).kind, message).toBe("wallet-rejected");
    }
  });

  it("reads messages from plain objects and strings", () => {
    expect(toWalletError({ code: -4, message: "User rejected the request" }).kind).toBe("wallet-rejected");
    expect(toWalletError("Wallet is locked").kind).toBe("wallet-unavailable");
  });

  it("classifies other failures as the wallet being unavailable", () => {
    expect(toWalletError(new Error("Freighter is not installed")).kind).toBe("wallet-unavailable");
  });

  it("returns an AppError unchanged", () => {
    const existing = new AppError("timeout", "slow");

    expect(toWalletError(existing)).toBe(existing);
  });
});

describe("createWalletsKitAdapter", () => {
  it("loads the kit once, for the configured network, and only when first used", async () => {
    const loadKit = vi.fn().mockResolvedValue(fakeKit());
    const adapter = createWalletsKitAdapter(TESTNET, loadKit);
    expect(loadKit).not.toHaveBeenCalled();

    await adapter.connect();
    await adapter.getAddress();
    await adapter.getNetworkPassphrase();

    expect(loadKit).toHaveBeenCalledOnce();
    expect(loadKit).toHaveBeenCalledWith(TESTNET);
  });

  it("connects and returns the chosen address", async () => {
    const adapter = createWalletsKitAdapter(TESTNET, async () => fakeKit());

    expect(await adapter.connect()).toBe(ADDRESS);
  });

  it("reports a closed wallet picker as a rejection", async () => {
    const kit = fakeKit({ authModal: vi.fn().mockRejectedValue({ message: "Modal closed by user" }) });
    const adapter = createWalletsKitAdapter(TESTNET, async () => kit);

    await expect(adapter.connect()).rejects.toMatchObject({ kind: "wallet-rejected" });
  });

  it("returns null instead of failing when nobody is connected or the network is unknown", async () => {
    const kit = fakeKit({
      getAddress: vi.fn().mockRejectedValue(new Error("no wallet selected")),
      getNetwork: vi.fn().mockRejectedValue(new Error("unsupported")),
    });
    const adapter = createWalletsKitAdapter(TESTNET, async () => kit);

    expect(await adapter.getAddress()).toBeNull();
    expect(await adapter.getNetworkPassphrase()).toBeNull();
  });

  it("signs with the options it is given", async () => {
    const kit = fakeKit();
    const adapter = createWalletsKitAdapter(TESTNET, async () => kit);

    const signed = await adapter.signTransaction("XDR", { networkPassphrase: TESTNET, address: ADDRESS });

    expect(signed.signedTxXdr).toBe("SIGNED");
    expect(kit.signTransaction).toHaveBeenCalledWith("XDR", { networkPassphrase: TESTNET, address: ADDRESS });
  });

  it("reports a refused signature as a rejection", async () => {
    const kit = fakeKit({ signTransaction: vi.fn().mockRejectedValue(new Error("User declined to sign")) });
    const adapter = createWalletsKitAdapter(TESTNET, async () => kit);

    await expect(adapter.signTransaction("XDR", { networkPassphrase: TESTNET, address: ADDRESS })).rejects.toMatchObject({
      kind: "wallet-rejected",
    });
  });

  it("disconnects", async () => {
    const kit = fakeKit();
    const adapter = createWalletsKitAdapter(TESTNET, async () => kit);

    await adapter.disconnect();

    expect(kit.disconnect).toHaveBeenCalledOnce();
  });
});

describe("assertWalletNetwork", () => {
  const walletOn = (passphrase: string | null) =>
    ({ getNetworkPassphrase: async () => passphrase }) as unknown as WalletAdapter;

  it("accepts a wallet on the expected network", async () => {
    await expect(assertWalletNetwork(walletOn(TESTNET), TESTNET)).resolves.toBeUndefined();
  });

  it("accepts a wallet that does not report its network", async () => {
    await expect(assertWalletNetwork(walletOn(null), TESTNET)).resolves.toBeUndefined();
  });

  it("rejects a wallet on another network", async () => {
    await expect(
      assertWalletNetwork(walletOn("Public Global Stellar Network ; September 2015"), TESTNET),
    ).rejects.toMatchObject({ kind: "wallet-network" });
  });
});

import { describe, expect, it, vi } from "vitest";

import type { Client } from "@/contracts/generated";
import { OTHER_ADDRESS, TEST_ADDRESS, confirmedTransaction, fakeWallet, testConfig } from "@/test-support/fakes";
import { connectedSigner } from "@/lib/wallet/connected-signer";

import { executeWrite } from "./execute-write";

describe("connectedSigner", () => {
  it("returns the connected account as the signer", async () => {
    const wallet = fakeWallet();

    const signer = await connectedSigner(wallet, testConfig.networkPassphrase);
    await signer.signTransaction("XDR", { networkPassphrase: testConfig.networkPassphrase, address: TEST_ADDRESS });

    expect(signer.address).toBe(TEST_ADDRESS);
    expect(wallet.signTransaction).toHaveBeenCalledWith("XDR", {
      networkPassphrase: testConfig.networkPassphrase,
      address: TEST_ADDRESS,
    });
  });

  it("fails when no wallet is connected", async () => {
    await expect(connectedSigner(fakeWallet({ address: null }), testConfig.networkPassphrase)).rejects.toMatchObject({
      kind: "wallet-unavailable",
    });
  });

  it("fails when the wallet is on another network", async () => {
    const wallet = fakeWallet({ networkPassphrase: "Public Global Stellar Network ; September 2015" });

    await expect(connectedSigner(wallet, testConfig.networkPassphrase)).rejects.toMatchObject({
      kind: "wallet-network",
    });
  });
});

describe("executeWrite", () => {
  const fakeClient = {} as Client;

  it("builds a client for the signer, runs the call and returns the receipt", async () => {
    const createClient = vi.fn().mockReturnValue(fakeClient);
    const call = vi.fn().mockResolvedValue(confirmedTransaction(5, "hash-5"));

    const receipt = await executeWrite({ config: testConfig, wallet: fakeWallet(), createClient }, call);

    expect(createClient).toHaveBeenCalledWith(testConfig, expect.objectContaining({ address: TEST_ADDRESS }));
    expect(call).toHaveBeenCalledWith(fakeClient, TEST_ADDRESS);
    expect(receipt).toMatchObject({ hash: "hash-5", value: 5 });
    expect(receipt.explorerUrl).toBe("https://stellar.expert/explorer/testnet/tx/hash-5");
  });

  it("does not build a client or call the contract when the wallet is not ready", async () => {
    const createClient = vi.fn();
    const call = vi.fn();

    await expect(
      executeWrite({ config: testConfig, wallet: fakeWallet({ address: null }), createClient }, call),
    ).rejects.toMatchObject({ kind: "wallet-unavailable" });
    expect(createClient).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("acts as the connected account, not as someone else", async () => {
    const call = vi.fn().mockResolvedValue(confirmedTransaction(undefined));

    await executeWrite(
      { config: testConfig, wallet: fakeWallet({ address: OTHER_ADDRESS }), createClient: () => fakeClient },
      call,
    );

    expect(call).toHaveBeenCalledWith(fakeClient, OTHER_ADDRESS);
  });
});

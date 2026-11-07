import { describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors/app-error";
import { TEST_ADDRESS, fakeWallet, testConfig } from "@/test-support/fakes";

import { createWalletSessionStore } from "./wallet-session-store";

const passphrase = testConfig.networkPassphrase;

describe("wallet session store", () => {
  it("starts disconnected", () => {
    expect(createWalletSessionStore(fakeWallet(), passphrase).getState()).toEqual({ status: "disconnected" });
  });

  it("connects and records the address, passing through the connecting state", async () => {
    const store = createWalletSessionStore(fakeWallet(), passphrase);
    const seen: string[] = [];
    store.subscribe(() => seen.push(store.getState().status));

    await store.connect();

    expect(seen).toEqual(["connecting", "connected"]);
    expect(store.getState()).toEqual({ status: "connected", address: TEST_ADDRESS });
  });

  it("keeps the same state object until the status changes", async () => {
    const store = createWalletSessionStore(fakeWallet(), passphrase);
    await store.connect();

    expect(store.getState()).toBe(store.getState());
  });

  it("reports a closed wallet prompt as a failure the screen can show quietly", async () => {
    const wallet = fakeWallet();
    wallet.connect = vi.fn().mockRejectedValue(new AppError("wallet-rejected", "closed"));
    const store = createWalletSessionStore(wallet, passphrase);

    await store.connect();

    expect(store.getState()).toMatchObject({ status: "failed", error: { kind: "wallet-rejected" } });
  });

  it("refuses a wallet on another network", async () => {
    const wallet = fakeWallet({ networkPassphrase: "Public Global Stellar Network ; September 2015" });
    const store = createWalletSessionStore(wallet, passphrase);

    await store.connect();

    expect(store.getState()).toMatchObject({ status: "failed", error: { kind: "wallet-network" } });
  });

  it("picks up a wallet that was already connected", async () => {
    const store = createWalletSessionStore(fakeWallet(), passphrase);

    await store.restore();

    expect(store.getState()).toEqual({ status: "connected", address: TEST_ADDRESS });
  });

  it("stays disconnected on restore when nobody is connected", async () => {
    const store = createWalletSessionStore(fakeWallet({ address: null }), passphrase);

    await store.restore();

    expect(store.getState().status).toBe("disconnected");
  });

  it("does not overwrite an ongoing session on restore", async () => {
    const wallet = fakeWallet();
    const store = createWalletSessionStore(wallet, passphrase);
    await store.connect();
    vi.mocked(wallet.getAddress).mockClear();

    await store.restore();

    expect(wallet.getAddress).not.toHaveBeenCalled();
  });

  it("disconnects, and ends disconnected even if the wallet fails to say goodbye", async () => {
    const wallet = fakeWallet();
    wallet.disconnect = vi.fn().mockRejectedValue(new Error("boom"));
    const store = createWalletSessionStore(wallet, passphrase);
    await store.connect();

    await expect(store.disconnect()).rejects.toThrow("boom");

    expect(store.getState().status).toBe("disconnected");
  });

  it("stops notifying a listener that unsubscribed", async () => {
    const store = createWalletSessionStore(fakeWallet(), passphrase);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    await store.connect();

    expect(listener).not.toHaveBeenCalled();
  });
});

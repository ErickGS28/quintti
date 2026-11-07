"use client";

import { useEffect, useSyncExternalStore } from "react";

import { getConfig } from "@/config/env";
import { getWalletAdapter } from "@/lib/wallet/wallet-instance";

import {
  createWalletSessionStore,
  type WalletSessionState,
  type WalletSessionStore,
} from "../services/wallet-session-store";

let store: WalletSessionStore | undefined;

function sessionStore(): WalletSessionStore {
  store ??= createWalletSessionStore(getWalletAdapter(), getConfig().networkPassphrase);
  return store;
}

/** What the server renders: nobody is connected until the browser says otherwise. */
const SERVER_STATE: WalletSessionState = { status: "disconnected" };

/** Who is connected, with `connect` and `disconnect`. Share it across the app. */
export function useWalletSession() {
  const session = sessionStore();
  const state = useSyncExternalStore(session.subscribe, session.getState, () => SERVER_STATE);

  useEffect(() => {
    void session.restore();
  }, [session]);

  return { state, connect: session.connect, disconnect: session.disconnect };
}

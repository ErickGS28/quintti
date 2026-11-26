"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { appCopy } from "@/copy/app.es";
import { useExpenses, useTreasurySnapshot } from "@/features/public-view";
import { useWalletSession } from "@/features/wallet-session";
import { useBuilding } from "@/lib/buildings/building-context";
import { permissionsOf, rolesOf, type Permissions, type TreasuryRole } from "@/lib/treasury/roles";

/**
 * Everything an app screen needs to know about who is looking and what the treasury holds: the
 * connected account, its roles and the contract's state. Composed here, in the app layer, because
 * it joins several features.
 */
interface Session {
  address: string | null;
  roles: TreasuryRole[];
  roleNames: string[];
  permissions: Permissions;
  snapshot: ReturnType<typeof useTreasurySnapshot>;
  expenses: ReturnType<typeof useExpenses>;
  /** A name for an address the contract itself identifies (the assembly, the administration), else nothing. */
  nameFor: (address: string) => string | null;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { state } = useWalletSession();
  const { trusted } = useBuilding();
  const snapshot = useTreasurySnapshot();
  const expenses = useExpenses();

  const address = state.status === "connected" ? state.address : null;
  // A building opened from a link and not saved is read-only: whatever it says about roles is not believed.
  const roles = useMemo(
    () => (trusted && snapshot.data ? rolesOf(address, snapshot.data) : []),
    [trusted, address, snapshot.data],
  );

  const nameFor = useCallback(
    (candidate: string) => {
      if (!snapshot.data) return null;
      if (candidate === snapshot.data.assembly) return appCopy.roles.assembly;
      if (candidate === snapshot.data.administrator) return appCopy.roles.administrator;
      return null;
    },
    [snapshot.data],
  );

  const value = useMemo<Session>(
    () => ({
      address,
      roles,
      roleNames: roles.map((role) => appCopy.roles[role]),
      permissions: permissionsOf(roles),
      snapshot,
      expenses,
      nameFor,
    }),
    [address, roles, snapshot, expenses, nameFor],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}

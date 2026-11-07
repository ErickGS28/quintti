"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { appCopy } from "@/copy/app.es";
import { useDirectory } from "@/features/directory";
import { useExpenseDetails } from "@/features/expense-details";
import { useExpenses, useTreasurySnapshot, type ExpenseText } from "@/features/public-view";
import { useWalletSession } from "@/features/wallet-session";
import { permissionsOf, rolesOf, type Permissions, type TreasuryRole } from "@/lib/treasury/roles";

/**
 * Everything an app screen needs to know about who is looking and what the treasury holds: the
 * connected account and its roles, the contract's state, and the off-chain words that make it
 * readable. Composed here, in the app layer, because it joins several features.
 */
interface Session {
  address: string | null;
  roles: TreasuryRole[];
  roleNames: string[];
  permissions: Permissions;
  snapshot: ReturnType<typeof useTreasurySnapshot>;
  expenses: ReturnType<typeof useExpenses>;
  details: ReturnType<typeof useExpenseDetails>;
  buildingName: string;
  buildingUnits: number | null;
  /** A human name for an address: from the directory, else the role it holds, else nothing. */
  nameFor: (address: string) => string | null;
  /** The saved description and vendor name of an expense, if any. */
  textFor: (id: number) => ExpenseText | null;
  /** A vendor's name: from the directory, else the name the administration gave it in its latest expense. */
  vendorNameFor: (address: string) => string | null;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { state } = useWalletSession();
  const snapshot = useTreasurySnapshot();
  const expenses = useExpenses();
  const details = useExpenseDetails();
  const directory = useDirectory();

  const address = state.status === "connected" ? state.address : null;
  const roles = useMemo(() => (snapshot.data ? rolesOf(address, snapshot.data) : []), [address, snapshot.data]);

  const nameFor = useCallback(
    (candidate: string) => {
      const known = directory.nameFor(candidate);
      if (known) return known;
      if (!snapshot.data) return null;
      if (candidate === snapshot.data.assembly) return appCopy.roles.assembly;
      if (candidate === snapshot.data.administrator) return appCopy.roles.administrator;
      return null;
    },
    [directory, snapshot.data],
  );

  const textFor = useCallback(
    (id: number): ExpenseText | null => {
      const saved = details.byId.get(id);
      return saved ? { description: saved.description, vendorLabel: saved.vendorLabel } : null;
    },
    [details.byId],
  );

  // Off-chain details name the vendor of each expense; the contract says which address that is.
  const vendorLabels = useMemo(() => {
    const labels = new Map<string, string>();
    for (const expense of expenses.data ?? []) {
      const label = details.byId.get(expense.id)?.vendorLabel;
      if (label) labels.set(expense.vendor, label);
    }
    return labels;
  }, [expenses.data, details.byId]);

  const vendorNameFor = useCallback(
    (candidate: string) => directory.nameFor(candidate) ?? vendorLabels.get(candidate) ?? null,
    [directory, vendorLabels],
  );

  const value = useMemo<Session>(
    () => ({
      address,
      roles,
      roleNames: roles.map((role) => appCopy.roles[role]),
      permissions: permissionsOf(roles),
      snapshot,
      expenses,
      details,
      buildingName: directory.building?.name ?? appCopy.building.fallbackName,
      buildingUnits: directory.building?.units ?? null,
      nameFor,
      textFor,
      vendorNameFor,
    }),
    [address, roles, snapshot, expenses, details, directory.building, nameFor, textFor, vendorNameFor],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}

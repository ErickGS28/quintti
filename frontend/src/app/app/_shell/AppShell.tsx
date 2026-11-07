"use client";

import { FileCheck2, LayoutDashboard, PieChart, ReceiptText, Store, UsersRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Eyebrow } from "@/components/atoms/Eyebrow";
import { Drawer } from "@/components/organisms/Drawer";
import { MobileBar } from "@/components/organisms/MobileBar";
import { Sidebar, type SidebarItem } from "@/components/organisms/Sidebar";
import { Toaster } from "@/components/organisms/Toaster";
import { AppFrame } from "@/components/templates/AppFrame";
import { getConfig } from "@/config/env";
import { appCopy } from "@/copy/app.es";
import { WalletPanel } from "@/features/wallet-session";

import { appRoutes } from "./routes";
import { SessionProvider, useSession } from "./session";

const ICON = "size-[1.125rem]";

function BuildingCard() {
  const { buildingName, buildingUnits } = useSession();
  const network = getConfig().network;
  return (
    <div className="rounded-card bg-mist px-4 py-3.5">
      <p className="truncate text-[0.9375rem] font-semibold text-ink">{buildingName}</p>
      {buildingUnits && <p className="text-sm text-ink-faint">{appCopy.building.units(buildingUnits)}</p>}
      <div className="mt-2.5 text-royal">
        <Eyebrow dot="live" className="text-[0.625rem]">
          {appCopy.network.short[network]}
        </Eyebrow>
      </div>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { expenses, permissions, roleNames } = useSession();
  const pending = expenses.data?.filter((expense) => expense.status === "pending").length;
  const { nav } = appCopy;

  const items: SidebarItem[] = [
    { href: appRoutes.overview, label: nav.overview, icon: <LayoutDashboard className={ICON} />, exact: true },
    {
      href: appRoutes.expenses,
      label: nav.expenses,
      icon: <ReceiptText className={ICON} />,
      // The count matters to whoever has to sign; everyone else sees the list without a badge.
      count: permissions.canApprove ? pending : undefined,
    },
    { href: appRoutes.budget, label: nav.budget, icon: <PieChart className={ICON} /> },
    { href: appRoutes.vendors, label: nav.vendors, icon: <Store className={ICON} /> },
    { href: appRoutes.council, label: nav.council, icon: <UsersRound className={ICON} /> },
    { href: appRoutes.verify, label: nav.verify, icon: <FileCheck2 className={ICON} /> },
  ];

  return (
    <Sidebar
      homeHref="/"
      homeLabel={appCopy.brand}
      context={<BuildingCard />}
      navLabel={nav.label}
      items={items}
      currentPath={pathname}
      onNavigate={onNavigate}
      footer={<WalletPanel roleNames={roleNames} />}
    />
  );
}

function Frame({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { roleNames } = useSession();
  const { nav } = appCopy;

  return (
    <>
      <AppFrame
        skipLabel={appCopy.skip}
        sidebar={<Navigation />}
        mobileBar={
          <MobileBar
            homeHref={appRoutes.overview}
            homeLabel={appCopy.brand}
            menuLabel={nav.openMenu}
            onMenu={() => setMenuOpen(true)}
            trailing={<WalletPanel roleNames={roleNames} variant="compact" />}
          />
        }
      >
        {children}
      </AppFrame>
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} label={nav.drawer} closeLabel={nav.closeMenu}>
        <Navigation onNavigate={() => setMenuOpen(false)} />
      </Drawer>
      <Toaster closeLabel={appCopy.toasts.close} />
    </>
  );
}

/** The app around every screen: who is connected, the navigation, and the notices. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Frame>{children}</Frame>
    </SessionProvider>
  );
}

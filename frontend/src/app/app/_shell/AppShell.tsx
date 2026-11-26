"use client";

import { ArrowLeftRight, LayoutDashboard, Link2, ReceiptText, Scale } from "lucide-react";
import Link from "next/link";
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
import { useBuilding } from "@/lib/buildings/building-context";
import { copyText } from "@/lib/ui/copy-text";
import { toasts } from "@/lib/ui/toast-store";

import { BuildingNotice } from "./BuildingNotice";
import { InvalidBuildingLink } from "./InvalidBuildingLink";
import { appRoutes } from "./routes";
import { SessionProvider, useSession } from "./session";

const ICON = "size-[1.125rem]";

function BuildingCard({ onNavigate }: { onNavigate?: () => void }) {
  const network = getConfig().network;
  const { snapshot } = useSession();
  const { href, shareUrl } = useBuilding();
  const { building } = appCopy;

  async function share() {
    const copied = await copyText(shareUrl());
    toasts.show(copied ? { tone: "success", title: building.shared } : { tone: "error", title: building.shareFailed });
  }

  return (
    <div className="rounded-card bg-mist px-4 py-3.5">
      <p className="truncate text-[0.9375rem] font-semibold text-ink">{snapshot.data?.name || building.fallbackName}</p>
      <div className="mt-2.5 text-royal">
        <Eyebrow dot="live" className="text-[0.625rem]">
          {appCopy.network.short[network]}
        </Eyebrow>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        <Link
          href={href(appRoutes.buildings)}
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-ink-soft hover:text-royal"
        >
          <ArrowLeftRight className="size-3.5" aria-hidden="true" />
          {building.switch}
        </Link>
        <button
          type="button"
          onClick={() => void share()}
          className="inline-flex cursor-pointer items-center gap-1.5 text-ink-soft hover:text-royal"
        >
          <Link2 className="size-3.5" aria-hidden="true" />
          {building.share}
        </button>
      </div>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { expenses, permissions, roleNames } = useSession();
  const { href } = useBuilding();
  const pending = expenses.data?.filter((expense) => expense.status === "pending").length;
  const { nav } = appCopy;

  const items: SidebarItem[] = [
    {
      href: href(appRoutes.overview),
      match: appRoutes.overview,
      label: nav.overview,
      icon: <LayoutDashboard className={ICON} />,
      exact: true,
    },
    {
      href: href(appRoutes.expenses),
      match: appRoutes.expenses,
      label: nav.expenses,
      icon: <ReceiptText className={ICON} />,
      // The count matters to whoever has to sign; everyone else sees the list without a badge.
      count: permissions.canApprove ? pending : undefined,
    },
    { href: href(appRoutes.rules), match: appRoutes.rules, label: nav.rules, icon: <Scale className={ICON} /> },
  ];

  return (
    <Sidebar
      homeHref="/"
      homeLabel={appCopy.brand}
      context={<BuildingCard onNavigate={onNavigate} />}
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
  const { href } = useBuilding();
  const { nav } = appCopy;

  return (
    <>
      <AppFrame
        skipLabel={appCopy.skip}
        sidebar={<Navigation />}
        mobileBar={
          <MobileBar
            homeHref={href(appRoutes.overview)}
            homeLabel={appCopy.brand}
            menuLabel={nav.openMenu}
            onMenu={() => setMenuOpen(true)}
            trailing={<WalletPanel roleNames={roleNames} variant="compact" />}
          />
        }
      >
        <BuildingNotice />
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
  const { invalidLink } = useBuilding();
  if (invalidLink) return <InvalidBuildingLink />;
  return (
    <SessionProvider>
      <Frame>{children}</Frame>
    </SessionProvider>
  );
}

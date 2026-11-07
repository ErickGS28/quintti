import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/atoms/BrandMark";
import { classNames } from "@/lib/ui/class-names";

export type SidebarItem = {
  href: string;
  label: string;
  icon: ReactNode;
  /** A small count after the label, for example pending expenses. */
  count?: number;
  /** Active only on its own page, not on the pages under it (for the overview). */
  exact?: boolean;
};

type SidebarProps = {
  /** Where the brand links to. */
  homeHref: string;
  homeLabel: string;
  /** The place this account belongs to, under the brand. */
  context?: ReactNode;
  navLabel: string;
  items: readonly SidebarItem[];
  /** The current path, to mark the active item. */
  currentPath: string;
  /** The network and the wallet, pinned to the bottom. */
  footer?: ReactNode;
  /** Called after a link is followed, for example to close the mobile drawer. */
  onNavigate?: () => void;
};

/** An item is active on its own page and, unless it is exact, on the pages under it. */
function isActive(item: SidebarItem, currentPath: string): boolean {
  if (currentPath === item.href) return true;
  return !item.exact && currentPath.startsWith(`${item.href}/`);
}

/**
 * The app's navigation: the brand and the building at the top, one item per place, and the network
 * and the wallet at the bottom. Persistent on large screens, inside a drawer on phones.
 */
export function Sidebar({
  homeHref,
  homeLabel,
  context,
  navLabel,
  items,
  currentPath,
  footer,
  onNavigate,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-cloud">
      <div className="px-5 pt-6 pb-5">
        <Link
          href={homeHref}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-control focus-visible:outline-offset-4"
        >
          <BrandMark className="size-9" />
          <span className="text-lg font-semibold tracking-tight text-ink">{homeLabel}</span>
        </Link>
        {context && <div className="mt-5">{context}</div>}
      </div>

      <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3">
        <ul className="grid gap-1">
          {items.map((item) => {
            const active = isActive(item, currentPath);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={classNames(
                    "group relative flex min-h-11 items-center gap-3 rounded-control px-3 text-[0.9375rem] font-medium transition-colors duration-200",
                    active ? "bg-royal-soft text-royal" : "text-ink-soft hover:bg-mist hover:text-ink",
                  )}
                >
                  {active && (
                    <span aria-hidden="true" className="absolute inset-y-2.5 -left-3 w-1 rounded-r-full bg-royal" />
                  )}
                  <span
                    aria-hidden="true"
                    className={classNames(
                      "flex size-5 items-center justify-center transition-colors",
                      active ? "text-royal" : "text-ink-faint group-hover:text-ink-soft",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="rounded-full bg-coral px-2 py-0.5 font-mono text-xs font-semibold text-on-coral tabular-nums">
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && <div className="border-t border-hairline p-4">{footer}</div>}
    </div>
  );
}

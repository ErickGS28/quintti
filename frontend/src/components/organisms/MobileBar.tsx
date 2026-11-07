import { Menu } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/atoms/BrandMark";
import { IconButton } from "@/components/atoms/IconButton";

type MobileBarProps = {
  homeHref: string;
  homeLabel: string;
  menuLabel: string;
  onMenu: () => void;
  /** Compact controls on the right, for example the wallet. */
  trailing?: ReactNode;
};

/** The top bar on phones and tablets: the menu, the brand, and the wallet. */
export function MobileBar({ homeHref, homeLabel, menuLabel, onMenu, trailing }: MobileBarProps) {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-hairline bg-veil px-3 backdrop-blur-xl sm:px-5">
      <IconButton aria-label={menuLabel} onClick={onMenu}>
        <Menu className="size-5" aria-hidden="true" />
      </IconButton>
      <Link href={homeHref} className="flex items-center gap-2.5">
        <BrandMark className="size-8" />
        <span className="text-base font-semibold tracking-tight text-ink">{homeLabel}</span>
      </Link>
      <div className="ml-auto flex items-center">{trailing}</div>
    </div>
  );
}

"use client";

import { LinkIcon } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { appCopy } from "@/copy/app.es";

import { appRoutes } from "./routes";

/**
 * A link that carries an `edificio` value that is not a contract address. It says so, instead of quietly
 * showing the main building: someone who followed a broken link would otherwise believe they were looking
 * at their own.
 */
export function InvalidBuildingLink() {
  const { building } = appCopy;
  return (
    <main className="app-surface flex min-h-dvh items-center justify-center px-4">
      <EmptyState
        icon={<LinkIcon className="size-6" />}
        title={building.invalidTitle}
        body={building.invalidBody}
        action={
          // A plain link to the main building: no query, so it leaves the broken one behind.
          <Link href={appRoutes.overview} className={buttonStyles({ shape: "pill" })}>
            {building.invalidAction}
          </Link>
        }
      />
    </main>
  );
}
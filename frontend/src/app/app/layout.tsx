import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/components/atoms/Spinner";
import { appCopy } from "@/copy/app.es";
import { BuildingProvider } from "@/lib/buildings/building-context";

import { AppShell } from "./_shell/AppShell";

export const metadata: Metadata = {
  title: appCopy.meta.title,
  description: appCopy.meta.description,
};

/**
 * The provider reads the address bar to know which building to show, and Next.js exports this app as static
 * files, so it has to sit inside a `Suspense` boundary or the build fails.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="app-surface flex min-h-dvh items-center justify-center">
          <Spinner className="size-8 text-royal" label="Cargando" />
        </div>
      }
    >
      <BuildingProvider>
        <AppShell>{children}</AppShell>
      </BuildingProvider>
    </Suspense>
  );
}
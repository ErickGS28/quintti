import type { Metadata } from "next";

import { appCopy } from "@/copy/app.es";

import { AppShell } from "./_shell/AppShell";

export const metadata: Metadata = {
  title: appCopy.meta.title,
  description: appCopy.meta.description,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

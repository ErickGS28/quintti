import type { Metadata } from "next";

import { vaultCopy } from "@/copy/boveda.es";

import { VaultPage } from "./_sections/VaultPage";

// A page for the challenge's reviewers: reached by its address, not linked from the product.
export const metadata: Metadata = {
  title: vaultCopy.meta.title,
  description: vaultCopy.meta.description,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VaultPage />;
}

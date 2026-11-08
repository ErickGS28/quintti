import type { Metadata } from "next";

import { hiwCopy } from "@/copy/hiw.es";

import { ManualPage } from "./_sections/ManualPage";

// The manual is shared by address, not linked: keep it out of search results.
export const metadata: Metadata = {
  title: hiwCopy.meta.title,
  description: hiwCopy.meta.description,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ManualPage />;
}

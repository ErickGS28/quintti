import type { Metadata } from "next";

import { negocioCopy } from "@/copy/negocio.es";

import { BusinessPage } from "./_sections/BusinessPage";

// The page is shared by address, not linked from the landing: keep it out of search results.
export const metadata: Metadata = {
  title: negocioCopy.meta.title,
  description: negocioCopy.meta.description,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <BusinessPage />;
}

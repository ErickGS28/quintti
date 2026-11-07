import type { Metadata } from "next";

import { landingCopy } from "@/copy/landing.es";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: landingCopy.meta.title,
  description: landingCopy.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

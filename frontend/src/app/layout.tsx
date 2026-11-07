import type { Metadata } from "next";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Quintti",
  description: "La cuenta del edificio con las reglas de la asamblea.",
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

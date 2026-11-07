import type { Metadata } from "next";

import { VerifyScreen } from "../_screens/VerifyScreen";

export const metadata: Metadata = { title: "Verificar una factura · Quintti" };

export default function Page() {
  return <VerifyScreen />;
}

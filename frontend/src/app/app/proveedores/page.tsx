import type { Metadata } from "next";

import { VendorsScreen } from "../_screens/VendorsScreen";

export const metadata: Metadata = { title: "Proveedores · Quintti" };

export default function Page() {
  return <VendorsScreen />;
}

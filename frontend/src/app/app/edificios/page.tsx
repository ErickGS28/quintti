import type { Metadata } from "next";

import { BuildingsScreen } from "../_screens/BuildingsScreen";

export const metadata: Metadata = { title: "Mis edificios · Quintti" };

export default function Page() {
  return <BuildingsScreen />;
}
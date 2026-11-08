import type { Metadata } from "next";

import { RulesScreen } from "../_screens/RulesScreen";

export const metadata: Metadata = { title: "Reglas · Quintti" };

export default function Page() {
  return <RulesScreen />;
}
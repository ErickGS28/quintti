import type { Metadata } from "next";

import { BudgetScreen } from "../_screens/BudgetScreen";

export const metadata: Metadata = { title: "Presupuesto · Quintti" };

export default function Page() {
  return <BudgetScreen />;
}

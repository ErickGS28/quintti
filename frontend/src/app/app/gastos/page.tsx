import type { Metadata } from "next";

import { ExpensesScreen } from "../_screens/ExpensesScreen";

export const metadata: Metadata = { title: "Gastos · Quintti" };

export default function Page() {
  return <ExpensesScreen />;
}

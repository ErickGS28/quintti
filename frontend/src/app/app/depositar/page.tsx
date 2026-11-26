import type { Metadata } from "next";

import { DepositScreen } from "../_screens/DepositScreen";

export const metadata: Metadata = { title: "Depositar · Quintti" };

export default function Page() {
  return <DepositScreen />;
}
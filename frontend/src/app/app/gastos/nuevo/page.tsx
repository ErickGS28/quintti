import type { Metadata } from "next";

import { ProposeScreen } from "../../_screens/ProposeScreen";

export const metadata: Metadata = { title: "Proponer un gasto · Quintti" };

export default function Page() {
  return <ProposeScreen />;
}

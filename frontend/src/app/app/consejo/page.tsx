import type { Metadata } from "next";

import { CouncilScreen } from "../_screens/CouncilScreen";

export const metadata: Metadata = { title: "Consejo y roles · Quintti" };

export default function Page() {
  return <CouncilScreen />;
}

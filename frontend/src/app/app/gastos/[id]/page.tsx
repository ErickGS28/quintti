import type { Metadata } from "next";

import { ExpenseScreen } from "../../_screens/ExpenseScreen";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Gasto #${id} · Quintti` };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ExpenseScreen idText={id} />;
}

import type { Metadata } from "next";

import { ExpenseScreen } from "../../_screens/ExpenseScreen";

type Props = { params: Promise<{ id: string }> };

/**
 * The site is exported as static files, so the pages of the expenses are built ahead of time: #0 to
 * #49, far more than a building files in a demo. Another number has no page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Gasto #${id} · Quintti` };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ExpenseScreen idText={id} />;
}

import type { ReactNode } from "react";

type DetailListProps = {
  items: ReadonlyArray<{ label: string; value: ReactNode }>;
};

/** Labelled facts in two columns on wide screens, one under the other on phones. */
export function DetailList({ items }: DetailListProps) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{item.label}</dt>
          <dd className="mt-1.5 text-base text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

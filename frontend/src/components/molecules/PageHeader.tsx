import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** A small label above the title. */
  eyebrow?: ReactNode;
  /** Buttons on the right on large screens, under the text on phones. */
  actions?: ReactNode;
};

/** The top of every screen: what this place is and what you can do here. */
export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="text-[length:clamp(1.75rem,3vw,2.375rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-pretty text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

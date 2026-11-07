import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
};

/** What a list shows when it has nothing yet, and what to do about it. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-royal-soft text-royal">
        {icon}
      </span>
      <p className="mt-4 text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm leading-relaxed text-pretty text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

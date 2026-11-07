"use client";

import { CircleCheck, ExternalLink, Info, TriangleAlert, X } from "lucide-react";
import { useSyncExternalStore } from "react";

import { classNames } from "@/lib/ui/class-names";
import { toasts, type Toast } from "@/lib/ui/toast-store";

const ICONS = {
  success: <CircleCheck className="size-5 text-royal" aria-hidden="true" />,
  error: <TriangleAlert className="size-5 text-wine" aria-hidden="true" />,
  info: <Info className="size-5 text-royal" aria-hidden="true" />,
};

const EMPTY: readonly Toast[] = [];

/**
 * Short notices that float at the bottom of the screen, for example when a transaction is
 * confirmed. Read from the shared toast store; announced politely to screen readers.
 */
export function Toaster({ closeLabel }: { closeLabel: string }) {
  const items = useSyncExternalStore(toasts.subscribe, toasts.getToasts, () => EMPTY);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className={classNames(
            "card-solid pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-card bg-cloud p-4 shadow-float",
            toast.tone === "error" && "ring-1 ring-coral/40",
          )}
        >
          <span className="mt-0.5 shrink-0">{ICONS[toast.tone]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{toast.title}</p>
            {toast.description && <p className="mt-0.5 text-sm text-pretty text-ink-soft">{toast.description}</p>}
            {toast.action && (
              <a
                href={toast.action.href}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-royal underline-offset-4 hover:underline"
              >
                {toast.action.label}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => toasts.dismiss(toast.id)}
            aria-label={closeLabel}
            className="-m-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-mist hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

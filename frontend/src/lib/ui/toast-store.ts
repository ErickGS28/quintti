export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  /** An optional link, for example to the transaction in the explorer. */
  action?: { label: string; href: string };
}

export type ToastInput = Omit<Toast, "id">;

/** How long a toast stays before it leaves on its own. Errors stay until dismissed. */
export const TOAST_DURATION_MS = 6_000;

/** At most this many toasts are shown at once; the oldest leaves first. */
const MAX_TOASTS = 3;

/**
 * Short notices that float above the page, kept outside React so any code can raise one and the
 * store can be tested on its own. The list object only changes when a toast is added or removed,
 * which is what `useSyncExternalStore` needs.
 */
export function createToastStore(schedule: (run: () => void, ms: number) => unknown = setTimeout) {
  let toasts: Toast[] = [];
  let nextId = 1;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  const dismiss = (id: number) => {
    const remaining = toasts.filter((toast) => toast.id !== id);
    if (remaining.length === toasts.length) return;
    toasts = remaining;
    emit();
  };

  return {
    getToasts: (): readonly Toast[] => toasts,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    show(input: ToastInput): number {
      const toast = { ...input, id: nextId++ };
      toasts = [...toasts, toast].slice(-MAX_TOASTS);
      emit();
      if (toast.tone !== "error") schedule(() => dismiss(toast.id), TOAST_DURATION_MS);
      return toast.id;
    },

    dismiss,
  };
}

export type ToastStore = ReturnType<typeof createToastStore>;

/** The app's single toast store. */
export const toasts = createToastStore();

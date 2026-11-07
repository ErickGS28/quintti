"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { IconButton } from "@/components/atoms/IconButton";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  closeLabel: string;
  children: ReactNode;
};

/**
 * A panel that slides in from the left over a dimmed page. Built on the native modal dialog, so
 * focus stays inside, Escape closes it and the page behind cannot be reached until it closes.
 */
export function Drawer({ open, onClose, label, closeLabel, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dimmed backdrop lands on the dialog itself.
        if (event.target === ref.current) onClose();
      }}
      className="drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(20rem,86vw)] max-w-none bg-cloud p-0 shadow-float"
    >
      <div className="relative h-full">
        <div className="absolute top-5 right-3 z-10">
          <IconButton aria-label={closeLabel} onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}

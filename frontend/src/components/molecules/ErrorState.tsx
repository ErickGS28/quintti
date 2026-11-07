import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/atoms/Button";

type ErrorStateProps = {
  title: string;
  message: string;
  /** Shown as a button when the failure is worth trying again. */
  retry?: { label: string; onRetry: () => void };
};

/** A failure explained in plain words, with a way to try again. */
export function ErrorState({ title, message, retry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-coral-soft text-wine">
        <TriangleAlert className="size-6" />
      </span>
      <p className="mt-4 text-lg font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-pretty text-ink-soft">{message}</p>
      {retry && (
        <Button variant="soft" className="mt-5" onClick={retry.onRetry}>
          <RotateCw className="size-4" aria-hidden="true" />
          {retry.label}
        </Button>
      )}
    </div>
  );
}

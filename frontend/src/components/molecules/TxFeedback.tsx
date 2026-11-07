import { CircleCheck, ExternalLink, TriangleAlert } from "lucide-react";

import { Spinner } from "@/components/atoms/Spinner";
import { classNames } from "@/lib/ui/class-names";

export type TxFeedbackState =
  | { status: "pending"; message: string }
  | { status: "success"; message: string; link?: { label: string; href: string } }
  | { status: "error"; message: string };

const TONES = {
  pending: "bg-royal-soft text-royal",
  success: "bg-royal-soft text-royal",
  error: "bg-coral-soft text-wine",
};

/**
 * Where a transaction stands: waiting for the wallet or the network, done with a link to the
 * explorer, or failed with the reason. Announced to screen readers as it changes.
 */
export function TxFeedback({ state }: { state: TxFeedbackState }) {
  return (
    <div
      role={state.status === "error" ? "alert" : "status"}
      className={classNames("flex items-start gap-3 rounded-control px-4 py-3 text-sm font-medium", TONES[state.status])}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {state.status === "pending" && <Spinner className="size-4" />}
        {state.status === "success" && <CircleCheck className="size-4" />}
        {state.status === "error" && <TriangleAlert className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-pretty">{state.message}</p>
        {state.status === "success" && state.link && (
          <a
            href={state.link.href}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
          >
            {state.link.label}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

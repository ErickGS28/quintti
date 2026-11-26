"use client";

import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { appCopy } from "@/copy/app.es";
import { useBuilding } from "@/lib/buildings/building-context";
import { toasts } from "@/lib/ui/toast-store";

import { useSession } from "./session";

/**
 * What a person sees first when they reach a building through a link they have not saved. A link can point
 * at any contract, including one that only looks like a building, so such a building is read-only: nobody
 * can sign on it until the person has seen its address and chosen to keep it.
 */
export function BuildingNotice() {
  const { contractId, trusted, save } = useBuilding();
  const { snapshot } = useSession();
  const { untrusted: copy } = appCopy.building;

  if (trusted) return null;

  // Saving only makes sense for something that reads as a Quintti building.
  const readable = snapshot.isSuccess;

  return (
    <Card padding="md" className="mb-6 border border-coral/40 bg-coral-soft/40" role="status">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-coral-soft text-wine"
        >
          <ShieldAlert className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">{copy.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-soft">{copy.body}</p>
          <div className="mt-3">
            <p className="font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">{copy.address}</p>
            <div className="mt-1.5 font-mono text-sm break-all text-ink">{contractId}</div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              size="md"
              shape="pill"
              disabled={!readable}
              onClick={() => {
                save(contractId);
                toasts.show({ tone: "success", title: copy.saved });
              }}
            >
              {copy.save}
            </Button>
            {!readable && !snapshot.isPending && <span className="text-sm text-wine">{copy.notReadable}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

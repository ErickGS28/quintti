import { Check, Clock3, X } from "lucide-react";

import { Badge, type BadgeTone } from "@/components/atoms/Badge";
import { appCopy } from "@/copy/app.es";

import type { ExpenseStatusView } from "../types";

const LOOK: Record<ExpenseStatusView, { tone: BadgeTone; icon: React.ReactNode }> = {
  pending: { tone: "neutral", icon: <Clock3 className="size-3.5" aria-hidden="true" /> },
  paid: { tone: "royal", icon: <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> },
  cancelled: { tone: "coral", icon: <X className="size-3.5" strokeWidth={3} aria-hidden="true" /> },
};

/** The state of an expense in words, with an icon; the color only supports the word. */
export function ExpenseStatusBadge({ status, className }: { status: ExpenseStatusView; className?: string }) {
  const look = LOOK[status];
  return (
    <Badge tone={look.tone} className={className}>
      {look.icon}
      {appCopy.status[status]}
    </Badge>
  );
}

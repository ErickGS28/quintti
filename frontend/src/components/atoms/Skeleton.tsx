import { classNames } from "@/lib/ui/class-names";

/** A soft placeholder that pulses while data loads. Size and shape come from the caller. */
export function Skeleton({ className }: { className: string }) {
  return <span aria-hidden="true" className={classNames("block animate-pulse rounded-control bg-periwinkle-soft", className)} />;
}

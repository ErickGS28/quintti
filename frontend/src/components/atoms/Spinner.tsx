import { classNames } from "@/lib/ui/class-names";

type SpinnerProps = {
  /** Size and color come from the caller, for example "size-5 text-royal". */
  className?: string;
  /** Read by screen readers. Without it the spinner is decorative. */
  label?: string;
};

/** A thin ring that turns while something is on its way. */
export function Spinner({ className = "size-5", label }: SpinnerProps) {
  return (
    <span role={label ? "status" : undefined} className="inline-flex">
      <svg className={classNames("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

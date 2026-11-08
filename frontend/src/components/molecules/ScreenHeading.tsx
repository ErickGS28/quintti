import { Eyebrow } from "@/components/atoms/Eyebrow";
import { classNames } from "@/lib/ui/class-names";

type ScreenHeadingProps = {
  /** A short label above the statement, for example "El problema". */
  eyebrow: string;
  /** The statement of the screen, set large. This is the section's heading. */
  title: string;
  /** One sentence that supports the statement. */
  lead?: string;
  /** Drops the label on short windows, for the screens with the most content. */
  compact?: boolean;
  /** Keeps the supporting sentence on short windows, for a screen whose context is the point. */
  keepLead?: boolean;
  className?: string;
};

/**
 * The top of a landing screen, centered: a small label, one clear statement, one supporting
 * sentence. Colors come from the screen's tone.
 */
export function ScreenHeading({ eyebrow, title, lead, compact = false, keepLead = false, className }: ScreenHeadingProps) {
  return (
    <header className={classNames("mx-auto flex max-w-4xl flex-col items-center text-center", className)}>
      <div className={classNames("reveal text-slide-accent", compact && "short:hidden")}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="reveal mt-4 text-[length:clamp(1.875rem,min(4.4vw,7.2vh),3.75rem)] leading-[1.05] font-bold tracking-[-0.035em] text-balance">
        {title}
      </h2>
      {lead && (
        <p
          className={classNames(
            "reveal mt-4 max-w-2xl text-[length:clamp(1.0625rem,1.5vw,1.3125rem)] leading-relaxed text-pretty text-slide-text",
            !keepLead && "short:hidden",
          )}
        >
          {lead}
        </p>
      )}
    </header>
  );
}

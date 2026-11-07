import { classNames } from "@/lib/ui/class-names";

type BlurInTextProps = {
  text: string;
  /** Delay between one letter and the next, in milliseconds. */
  stagger?: number;
  /** Delay before the first letter, in milliseconds. */
  startDelay?: number;
  className?: string;
};

/**
 * Title whose letters come into focus one after another when the page loads.
 * Pure CSS, so it needs no client code. Screen readers get the plain text; reduced motion shows it at once.
 */
export function BlurInText({ text, stagger = 90, startDelay = 150, className }: BlurInTextProps) {
  return (
    <span className={classNames("inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {Array.from(text).map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="animate-letter-in inline-block"
            style={{ animationDelay: `${startDelay + index * stagger}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}

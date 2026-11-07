import { classNames } from "@/lib/ui/class-names";

type Option<T extends string> = { value: T; label: string; count?: number };

type SegmentedControlProps<T extends string> = {
  label: string;
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
};

/** A row of mutually exclusive choices in one pill, for filters. Scrolls sideways on narrow screens. */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="-mx-1 max-w-full overflow-x-auto px-1 pb-1">
      <div className="inline-flex gap-1 rounded-full bg-cloud p-1 shadow-card">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={classNames(
                "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
                selected ? "bg-royal text-on-royal" : "text-ink-soft hover:bg-royal-soft hover:text-royal",
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span
                  className={classNames(
                    "rounded-full px-1.5 font-mono text-xs tabular-nums",
                    selected ? "bg-white/20" : "bg-mist text-ink-faint",
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

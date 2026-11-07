"use client";

import { useEffect, useState } from "react";

import { classNames } from "@/lib/ui/class-names";

type RailItem = { id: string; label: string };

type SlideRailProps = {
  label: string;
  items: readonly RailItem[];
};

/**
 * Vertical dots on the right edge, one per chapter, like the pager of a slider. The dot of the chapter
 * that crosses the middle of the window is stretched. Large screens only: phones scroll without it.
 */
export function SlideRail({ label, items }: SlideRailProps) {
  const [active, setActive] = useState(items[0]?.id);
  const key = items.map((item) => item.id).join("|");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const id of key.split("|")) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return (
    <nav aria-label={label} className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-center gap-0.5 rounded-full bg-veil p-1.5 shadow-float backdrop-blur-xl">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-label={item.label}
                aria-current={current ? "true" : undefined}
                className="group relative flex size-7 items-center justify-center rounded-full"
              >
                <span
                  className={classNames(
                    "block w-2 rounded-full transition-all duration-300",
                    current ? "h-5 bg-royal" : "h-2 bg-royal/30 group-hover:bg-royal/60",
                  )}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full mr-3 rounded-full bg-royal px-3 py-1 text-sm font-semibold whitespace-nowrap text-on-royal opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

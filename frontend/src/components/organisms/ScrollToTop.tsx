"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { classNames } from "@/lib/ui/class-names";

/** Scroll distance after which the button appears, in pixels. */
const VISIBLE_AFTER = 480;

type ScrollToTopProps = {
  label: string;
  /** Position classes. Defaults to the bottom-left corner. */
  className?: string;
};

/** Round button that brings the reader back to the top. Hidden until the page has been scrolled. */
export function ScrollToTop({ label, className = "bottom-6 left-6" }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > VISIBLE_AFTER);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      className={classNames(
        "fixed z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-royal text-on-royal shadow-float ring-2 ring-white/70 transition-all duration-300 hover:bg-royal-strong",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        className,
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}

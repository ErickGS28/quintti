import { Plus } from "lucide-react";

import { Chapter } from "@/components/molecules/Chapter";
import { landingCopy } from "@/copy/landing.es";

const { faq } = landingCopy;

/** Native disclosure elements: keyboard and screen reader behavior come for free. */
export function FaqSection() {
  return (
    <Chapter id={faq.id} tone="canvas">
      <div className="mx-auto flex min-h-dvh max-w-4xl snap-start flex-col justify-center px-5 py-28 sm:px-8">
        <h2 className="reveal text-center text-[length:clamp(2.5rem,6vw,5.5rem)] leading-none font-bold tracking-tight text-balance">
          {faq.eyebrow}
        </h2>
        <p className="reveal mt-5 text-center text-[length:clamp(1.25rem,2.4vw,2rem)] font-semibold text-balance text-slide-accent">
          {faq.title}
        </p>
        <div className="mt-12 grid gap-3">
          {faq.items.map((item) => (
            <details key={item.question} className="reveal group rounded-card bg-mist shadow-card open:bg-cloud">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-6 py-5 text-lg font-bold text-royal sm:px-8 sm:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-royal text-on-royal">
                  <Plus
                    className="size-5 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                    strokeWidth={2.5}
                  />
                </span>
              </summary>
              <p className="px-6 pb-6 text-lg leading-relaxed text-pretty sm:px-8 sm:pb-8 sm:text-xl">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Chapter>
  );
}

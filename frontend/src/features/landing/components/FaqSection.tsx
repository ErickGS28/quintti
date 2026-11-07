import { Plus } from "lucide-react";

import { SectionHeading } from "@/components/molecules/SectionHeading";
import { landingCopy } from "@/copy/landing.es";

const { faq } = landingCopy;

/** Native disclosure elements: keyboard and screen reader behavior come for free. */
export function FaqSection() {
  return (
    <section id={faq.id} className="scroll-mt-28 bg-mist">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow={faq.eyebrow} title={faq.title} />
        <div className="mt-12 grid gap-3">
          {faq.items.map((item) => (
            <details key={item.question} className="group rounded-card bg-cloud shadow-card">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-4 font-semibold sm:px-6 [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  className="size-5 shrink-0 text-royal transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-pretty leading-relaxed text-ink-soft sm:px-6 sm:pb-6">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

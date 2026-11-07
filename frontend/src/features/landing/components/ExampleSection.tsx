import { SectionHeading } from "@/components/molecules/SectionHeading";
import { landingCopy } from "@/copy/landing.es";

import { ExampleDemo } from "./ExampleDemo";

const { example } = landingCopy;

/** One concrete case, told as a walk-through the reader can click through. */
export function ExampleSection() {
  return (
    <section id={example.id} className="scroll-mt-28 bg-mist">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow={example.eyebrow} title={example.title} description={example.body} />
        <ExampleDemo />
        <p className="mt-6 text-sm text-ink-faint">{example.note}</p>
      </div>
    </section>
  );
}

import { Chapter } from "@/components/molecules/Chapter";
import { Slide } from "@/components/molecules/Slide";
import { TitleSlide } from "@/components/molecules/TitleSlide";
import { landingCopy } from "@/copy/landing.es";

import { ExampleDemo } from "./ExampleDemo";

const { example } = landingCopy;

/** One concrete case, told as a walk-through the reader can click through. */
export function ExampleSection() {
  return (
    <Chapter id={example.id} tone="mist">
      <TitleSlide index="03" indexLabel={landingCopy.nav.chapter} title={example.eyebrow} lead={example.title} />
      <Slide>
        <p className="reveal mx-auto max-w-3xl text-center text-[length:clamp(1.25rem,2.2vw,1.875rem)] leading-relaxed text-pretty">
          {example.body}
        </p>
        <ExampleDemo />
        <p className="mt-6 text-center text-base text-slide-muted">{example.note}</p>
      </Slide>
    </Chapter>
  );
}

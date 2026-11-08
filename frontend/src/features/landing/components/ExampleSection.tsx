import { Chapter } from "@/components/molecules/Chapter";
import { ScreenHeading } from "@/components/molecules/ScreenHeading";
import { landingCopy } from "@/copy/landing.es";

import { ExampleDemo } from "./ExampleDemo";

const { example } = landingCopy;

/** One concrete case, told as a walk-through the reader can click through. */
export function ExampleSection() {
  return (
    <Chapter id={example.id} tone="mist">
      <ScreenHeading eyebrow={example.eyebrow} title={example.title} lead={example.lead} compact />
      <ExampleDemo />
    </Chapter>
  );
}

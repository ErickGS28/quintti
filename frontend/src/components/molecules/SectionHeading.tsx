import type { ReactNode } from "react";

import { classNames } from "@/lib/ui/class-names";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "start", className }: SectionHeadingProps) {
  return (
    <div className={classNames("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="mb-3 text-sm font-semibold tracking-wide text-wine">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-royal sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">{description}</p>}
    </div>
  );
}

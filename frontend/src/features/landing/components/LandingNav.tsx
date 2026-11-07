import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/atoms/BrandMark";
import { ButtonLink } from "@/components/atoms/Button";
import { FloatingNav } from "@/components/molecules/FloatingNav";
import { landingCopy } from "@/copy/landing.es";

const { nav, hero, problem, solution, example, why, faq } = landingCopy;

const LINKS = [
  { id: problem.id, label: nav.problem },
  { id: solution.id, label: nav.solution },
  { id: example.id, label: nav.example },
  { id: why.id, label: nav.why },
  { id: faq.id, label: nav.faq },
];

/**
 * Floating dark-glass menu: the brand on the left, the chapters in the middle and one action on the
 * right. On phones and tablets only the brand and the action fit; the pager and the page itself
 * lead the way there.
 */
export function LandingNav() {
  return (
    <FloatingNav label={nav.menuLabel} placement="top" width="full" surface="night" className="-mb-14">
      <div className="flex w-full items-center justify-between gap-2">
        <a
          href={`#${hero.id}`}
          aria-label={nav.brandLabel}
          className="group flex min-h-11 items-center gap-2.5 rounded-full pr-4 pl-2.5 transition-colors duration-200 hover:bg-white/6"
        >
          <BrandMark tone="night" className="size-8" />
          <span className="text-[1.0625rem] font-semibold tracking-tight text-canvas">Quintti</span>
        </a>

        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium text-periwinkle-soft transition-colors duration-200 hover:bg-white/8 hover:text-canvas"
            >
              {link.label}
            </a>
          ))}
        </div>

        <ButtonLink href={`#${example.id}`} shape="pill" variant="light" className="group/cta min-h-11 px-5">
          {nav.cta}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
            aria-hidden="true"
          />
        </ButtonLink>
      </div>
    </FloatingNav>
  );
}

import { FloatingNav } from "@/components/molecules/FloatingNav";
import { landingCopy } from "@/copy/landing.es";
import { classNames } from "@/lib/ui/class-names";

const { nav, problem, solution, example, why, faq } = landingCopy;

/** On phones only two links fit; the rest appear from medium screens up. */
const LINKS = [
  { id: problem.id, label: nav.problem, onPhone: false },
  { id: solution.id, label: nav.solution, onPhone: true },
  { id: example.id, label: nav.example, onPhone: true },
  { id: why.id, label: nav.why, onPhone: false },
  { id: faq.id, label: nav.faq, onPhone: false },
];

/** Floating, rounded menu with the section links centered. The logo lives in the hero, not here. */
export function LandingNav() {
  return (
    <FloatingNav label={nav.menuLabel} placement="top" width="fit">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={classNames(
              "min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-royal-soft hover:text-royal sm:px-5 sm:text-[0.9375rem]",
              link.onPhone ? "flex" : "hidden md:flex",
            )}
          >
            {link.label}
          </a>
        ))}
      </div>
    </FloatingNav>
  );
}

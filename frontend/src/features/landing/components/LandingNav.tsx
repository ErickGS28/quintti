import { FloatingNav } from "@/components/molecules/FloatingNav";
import { landingCopy } from "@/copy/landing.es";

const { nav, problem, why } = landingCopy;

/**
 * Only the screens that are on the page. The solution and the example links are commented out with
 * their screens (see `LandingPage`).
 */
const LINKS = [
  { id: problem.id, label: nav.problem },
  // { id: solution.id, label: nav.solution },
  // { id: example.id, label: nav.example },
  { id: why.id, label: nav.why },
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
            className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:bg-royal-soft hover:text-royal sm:px-5 sm:text-[0.9375rem]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </FloatingNav>
  );
}

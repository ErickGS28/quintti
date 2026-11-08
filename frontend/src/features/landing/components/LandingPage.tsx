import { PageWash } from "@/components/atoms/PageWash";
import { SlideRail } from "@/components/organisms/SlideRail";
import { SpotlightTracker } from "@/components/organisms/SpotlightTracker";
import { landingCopy } from "@/copy/landing.es";

import { ExampleSection } from "./ExampleSection";
import { Hero } from "./Hero";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { WhyStellarSection } from "./WhyStellarSection";

const { nav, hero, problem, solution, example, why } = landingCopy;

/** The screens a reader can jump to, for the pager on the right edge. */
const RAIL_ITEMS = [
  { id: hero.id, label: nav.home },
  { id: problem.id, label: nav.problem },
  { id: solution.id, label: nav.solution },
  { id: example.id, label: nav.example },
  { id: why.id, label: nav.why },
];

/**
 * The presentation page, one idea per screen: the hero, the problem, the solution (the rules, then
 * the flow), a clickable example, and why it needs Stellar. Scrolling settles on each screen
 * (`data-snap-page` turns it on). Static apart from the example and the pager.
 */
export function LandingPage() {
  return (
    <div data-snap-page className="relative isolate">
      {/* A snap point at the very top, so the page can come to rest on the hero. */}
      <div aria-hidden="true" className="h-0 snap-start" />
      <PageWash />
      <LandingNav />
      <SlideRail label={nav.railLabel} items={RAIL_ITEMS} />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ExampleSection />
        <WhyStellarSection />
      </main>
      <LandingFooter />
      <SpotlightTracker />
    </div>
  );
}

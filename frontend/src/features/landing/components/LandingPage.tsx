import { PageWash } from "@/components/atoms/PageWash";
import { CursorTrail } from "@/components/organisms/CursorTrail";
import { ScrollToTop } from "@/components/organisms/ScrollToTop";
import { SlideRail } from "@/components/organisms/SlideRail";
import { SpotlightTracker } from "@/components/organisms/SpotlightTracker";
import { landingCopy } from "@/copy/landing.es";

import { ExampleSection } from "./ExampleSection";
import { FaqSection } from "./FaqSection";
import { FinalCta } from "./FinalCta";
import { Hero } from "./Hero";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { WhyStellarSection } from "./WhyStellarSection";

const { nav, hero, problem, solution, example, why, faq, final } = landingCopy;

/** The chapters in reading order, for the pager on the right edge. */
const RAIL_ITEMS = [
  { id: hero.id, label: nav.home },
  { id: problem.id, label: nav.problem },
  { id: solution.id, label: nav.solution },
  { id: example.id, label: nav.example },
  { id: why.id, label: nav.why },
  { id: faq.id, label: nav.faq },
  { id: final.id, label: nav.closing },
];

/**
 * Presentation page, told as a stack of full-screen chapters: the problem, the solution, an example
 * you can click through, and why it needs Stellar. Menu on top, hero right below it. Static apart
 * from the example, the pager and the scroll button.
 */
export function LandingPage() {
  return (
    <div className="relative isolate">
      <PageWash />
      <LandingNav />
      <SlideRail label={nav.railLabel} items={RAIL_ITEMS} />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ExampleSection />
        <WhyStellarSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
      <ScrollToTop label={nav.scrollTop} />
      <SpotlightTracker />
      <CursorTrail />
    </div>
  );
}

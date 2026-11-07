import { PageWash } from "@/components/atoms/PageWash";
import { ScrollToTop } from "@/components/organisms/ScrollToTop";
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

/**
 * Presentation page, told as a short argument: the problem, the solution, an example you can click
 * through, and why it needs Stellar. Menu on top, hero right below it. Static apart from the example
 * and the scroll button.
 */
export function LandingPage() {
  return (
    <div className="relative isolate">
      <PageWash />
      <LandingNav />
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
      <ScrollToTop label={landingCopy.nav.scrollTop} />
    </div>
  );
}

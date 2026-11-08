import { landingCopy } from "@/copy/landing.es";

const { footer } = landingCopy;

/** A single quiet line under the last screen. */
export function LandingFooter() {
  return (
    <footer className="bg-canvas">
      <p className="mx-auto max-w-4xl px-5 py-6 text-center text-sm leading-relaxed text-ink-faint sm:px-8">
        {footer.line}
      </p>
    </footer>
  );
}

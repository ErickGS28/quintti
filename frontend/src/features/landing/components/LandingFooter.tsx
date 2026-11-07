import { landingCopy } from "@/copy/landing.es";

const { footer } = landingCopy;

/** Deep ink purple closes the page, so the last screen does not end on white. */
export function LandingFooter() {
  return (
    <footer className="bg-ink text-periwinkle-soft">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <p className="text-xl font-bold tracking-tight text-on-royal">Quintti</p>
        <p className="mt-3 max-w-3xl text-base leading-relaxed">{footer.line}</p>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-periwinkle">{footer.legal}</p>
      </div>
    </footer>
  );
}

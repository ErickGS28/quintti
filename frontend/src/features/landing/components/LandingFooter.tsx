import { landingCopy } from "@/copy/landing.es";

const { footer } = landingCopy;

export function LandingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="font-semibold tracking-tight text-royal">Quintti</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{footer.line}</p>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-faint">{footer.legal}</p>
      </div>
    </footer>
  );
}

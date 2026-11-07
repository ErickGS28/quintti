import { ArrowRight, ExternalLink } from "lucide-react";

import { Ripple } from "@/components/atoms/Ripple";
import { BrandMark } from "@/components/atoms/BrandMark";
import { ButtonLink } from "@/components/atoms/Button";
import { landingCopy, REPOSITORY_URL } from "@/copy/landing.es";

import { demoContractUrl } from "../services/contract-link";

const { final, example } = landingCopy;

/** Closing call to action, with links to verify the claims: the code and the contract. */
export function FinalCta() {
  const contract = demoContractUrl();

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="relative flex size-28 items-center justify-center">
          <Ripple tone="lavender" rings={3} />
          <BrandMark className="relative size-16" />
        </div>
        <h2 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-royal sm:text-5xl">{final.title}</h2>
        <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">{final.body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`#${example.id}`} size="lg" shape="pill">
            {final.primary}
            <ArrowRight className="size-5" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href={REPOSITORY_URL} size="lg" shape="pill" variant="soft" target="_blank" rel="noreferrer">
            {final.code}
            <ExternalLink className="size-4" aria-hidden="true" />
          </ButtonLink>
          {contract && (
            <ButtonLink href={contract} size="lg" shape="pill" variant="ghost" target="_blank" rel="noreferrer">
              {final.contract}
              <ExternalLink className="size-4" aria-hidden="true" />
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}

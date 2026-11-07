import { ArrowRight, ExternalLink } from "lucide-react";

import { BrandMark } from "@/components/atoms/BrandMark";
import { ButtonLink } from "@/components/atoms/Button";
import { Ripple } from "@/components/atoms/Ripple";
import { Chapter } from "@/components/molecules/Chapter";
import { landingCopy, REPOSITORY_URL } from "@/copy/landing.es";

import { demoContractUrl } from "../services/contract-link";

const { final, example } = landingCopy;

/** Closing call to action, with links to verify the claims: the code and the contract. */
export function FinalCta() {
  const contract = demoContractUrl();

  return (
    <Chapter id={final.id} tone="finale">
      <div className="relative mx-auto flex min-h-dvh max-w-5xl snap-start flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
        <div className="reveal relative -my-12 flex size-72 items-center justify-center text-slide-ring">
          <Ripple tone="current" rings={4} />
          <span className="relative flex size-28 items-center justify-center rounded-full bg-canvas shadow-float">
            <BrandMark className="size-20" />
          </span>
        </div>
        <h2 className="reveal mt-12 text-[length:clamp(2.25rem,5.5vw,5rem)] leading-[1.02] font-bold tracking-tight text-balance">
          {final.title}
        </h2>
        <p className="reveal mt-7 max-w-2xl text-[length:clamp(1.25rem,2.2vw,1.75rem)] leading-relaxed text-pretty text-slide-text">
          {final.body}
        </p>
        <div className="reveal mt-11 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`#${example.id}`} size="lg" shape="pill" variant="light">
            {final.primary}
            <ArrowRight className="size-5" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href={REPOSITORY_URL}
            size="lg"
            shape="pill"
            variant="glass"
            target="_blank"
            rel="noreferrer"
          >
            {final.code}
            <ExternalLink className="size-4" aria-hidden="true" />
          </ButtonLink>
          {contract && (
            <ButtonLink href={contract} size="lg" shape="pill" variant="glass" target="_blank" rel="noreferrer">
              {final.contract}
              <ExternalLink className="size-4" aria-hidden="true" />
            </ButtonLink>
          )}
        </div>
      </div>
    </Chapter>
  );
}

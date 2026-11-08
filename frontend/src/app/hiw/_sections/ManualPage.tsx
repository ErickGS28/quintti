import { ArrowRight, Check, Eye, Gavel, Landmark, PenLine, ShieldCheck, Store, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/atoms/Badge";
import { BrandMark } from "@/components/atoms/BrandMark";
import { buttonStyles } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { PageWash } from "@/components/atoms/PageWash";
import { hiwCopy } from "@/copy/hiw.es";

import { LiveRoles } from "./LiveRoles";

const { header, rules, roles, flow, screens, trial, glossary, limits } = hiwCopy;

const ROLE_ICONS: Record<string, ReactNode> = {
  resident: <Eye className="size-5" aria-hidden="true" />,
  administrator: <PenLine className="size-5" aria-hidden="true" />,
  council: <ShieldCheck className="size-5" aria-hidden="true" />,
  assembly: <Gavel className="size-5" aria-hidden="true" />,
  vendor: <Store className="size-5" aria-hidden="true" />,
};

function SectionTitle({ id, title, body }: { id: string; title: string; body?: string }) {
  return (
    <div id={id} className="scroll-mt-8">
      <h2 className="text-[length:clamp(1.5rem,2.6vw,2rem)] leading-tight font-semibold tracking-[-0.03em] text-ink">
        {title}
      </h2>
      {body && <p className="mt-3 max-w-3xl text-lg leading-relaxed text-pretty text-ink-soft">{body}</p>}
    </div>
  );
}

function Bullets({ items, tone }: { items: readonly string[]; tone: "can" | "cannot" }) {
  const can = tone === "can";
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-ink-soft">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
              can ? "bg-royal text-on-royal" : "bg-coral-soft text-wine"
            }`}
          >
            {can ? <Check className="size-3" strokeWidth={3.5} /> : <X className="size-3" strokeWidth={3.5} />}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The manual at `/hiw`: what Quintti enforces, who does what, how an expense travels, where each
 * thing is in the app and how to try it with a wallet. Hidden: nothing in the app links to it.
 */
export function ManualPage() {
  return (
    <div className="relative isolate min-h-dvh">
      <PageWash />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <BrandMark className="size-9" />
          <span className="text-lg font-semibold tracking-tight text-ink">{hiwCopy.topbar.home}</span>
        </Link>
        <Link href="/app" className={buttonStyles({ shape: "pill" })}>
          {hiwCopy.topbar.open}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <header className="pt-10 pb-12 sm:pt-16">
          <Eyebrow className="text-royal" dot="still">
            {header.eyebrow}
          </Eyebrow>
          <h1 className="mt-5 text-[length:clamp(2.5rem,6vw,4.5rem)] leading-[1] font-bold tracking-[-0.04em] text-balance text-ink">
            {header.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-pretty text-ink-soft">{header.body}</p>
          <nav aria-label="Contenido" className="mt-8 flex flex-wrap gap-2">
            {hiwCopy.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-full bg-cloud px-4 py-2 text-sm font-semibold text-royal shadow-card transition-colors hover:bg-royal-soft"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="grid gap-20">
          <section>
            <SectionTitle id={rules.id} title={rules.title} body={rules.body} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {rules.items.map((item, index) => (
                <li key={item.title}>
                  <Card padding="lg" className="h-full">
                    <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-lavender to-royal font-semibold text-on-royal">
                      {index + 1}
                    </span>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-pretty">{item.body}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id={roles.id} title={roles.title} body={roles.body} />
            <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roles.items.map((role) => (
                <li key={role.key}>
                  <Card padding="lg" className="h-full">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-royal-soft text-royal">
                        {ROLE_ICONS[role.key]}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">{role.name}</h3>
                        <p className="text-sm text-ink-faint">{role.who}</p>
                      </div>
                    </div>
                    <p className="mt-5 mb-2 font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">
                      {roles.can}
                    </p>
                    <Bullets items={role.can} tone="can" />
                    <p className="mt-5 mb-2 font-mono text-xs font-medium tracking-[0.12em] text-ink-faint uppercase">
                      {roles.cannot}
                    </p>
                    <Bullets items={role.cannot} tone="cannot" />
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id={flow.id} title={flow.title} body={flow.body} />
            <ol className="mt-8 grid gap-4">
              {flow.steps.map((step, index) => (
                <li key={step.title}>
                  <Card padding="lg" className="flex gap-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-coral text-xl font-bold text-on-coral">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                        <Badge tone="royal">{step.who}</Badge>
                      </div>
                      <p className="mt-2 max-w-3xl leading-relaxed text-pretty">{step.body}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-card bg-mist p-6 sm:p-8">
              <h3 className="text-lg font-semibold tracking-tight">{flow.notes.title}</h3>
              <ul className="mt-3 grid gap-2.5">
                {flow.notes.items.map((note) => (
                  <li key={note} className="flex items-start gap-3 leading-relaxed text-ink-soft">
                    <Landmark className="mt-1 size-4 shrink-0 text-royal" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <SectionTitle id={screens.id} title={screens.title} body={screens.body} />
            <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {screens.items.map((item) => (
                <Card key={item.name} padding="md">
                  <dt className="text-lg font-semibold tracking-tight text-royal">{item.name}</dt>
                  <dd className="mt-1.5 leading-relaxed text-pretty">{item.body}</dd>
                </Card>
              ))}
            </dl>
          </section>

          <section>
            <SectionTitle id={trial.id} title={trial.title} body={trial.body} />
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
              <Card padding="lg">
                <ol className="grid gap-5">
                  {trial.steps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-royal text-sm font-semibold text-on-royal">
                        {index + 1}
                      </span>
                      <p className="leading-relaxed text-pretty">{step}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-control bg-mist px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  {trial.deposit}
                </p>
              </Card>
              <div className="lg:sticky lg:top-6">
                <LiveRoles />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle id={glossary.id} title={glossary.title} />
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {glossary.items.map((item) => (
                <Card key={item.term} padding="md">
                  <dt className="font-semibold tracking-tight text-royal">{item.term}</dt>
                  <dd className="mt-1.5 leading-relaxed text-pretty">{item.body}</dd>
                </Card>
              ))}
            </dl>
          </section>

          <section>
            <SectionTitle id={limits.id} title={limits.title} body={limits.body} />
            <ul className="mt-6 grid gap-3">
              {limits.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg leading-relaxed text-ink-soft">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-2 shrink-0 rounded-full bg-coral"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-20 flex flex-wrap items-center gap-3 border-t border-hairline pt-8">
          <Link href="/app" className={buttonStyles({ size: "lg", shape: "pill" })}>
            {hiwCopy.footer.open}
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <Link href="/" className={buttonStyles({ size: "lg", shape: "pill", variant: "soft" })}>
            {hiwCopy.footer.back}
          </Link>
        </footer>
      </main>
    </div>
  );
}

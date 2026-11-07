import type { ReactNode } from "react";

type AppFrameProps = {
  /** The navigation, fixed on the left from large screens up. */
  sidebar: ReactNode;
  /** The top bar shown instead of the sidebar on phones and tablets. */
  mobileBar: ReactNode;
  /** Text of the link that lets keyboard users jump past the navigation. */
  skipLabel: string;
  children: ReactNode;
};

/**
 * The layout of every app screen: a persistent sidebar on large screens, a top bar on smaller ones,
 * and the content in a readable column on a tinted page.
 */
export function AppFrame({ sidebar, mobileBar, skipLabel, children }: AppFrameProps) {
  return (
    <div className="app-surface min-h-dvh">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-royal px-4 py-2 font-semibold text-on-royal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {skipLabel}
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-hairline lg:block">{sidebar}</aside>
      <div className="lg:pl-72">
        <div className="sticky top-0 z-20 lg:hidden">{mobileBar}</div>
        <main id="contenido" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}

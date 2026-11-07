# 0011. Landing polish: Geist, texture, a light that follows the pointer, lighter chapter openings

Status: Accepted. Amends [0010](0010-landing-as-colored-chapters.md) for the chapter openings.

## Context

Reviewing the landing page after 0010, the team found it looked unfinished next to production sites: the system font changes from one computer to another (Segoe UI on Windows), the colored surfaces are flat, nothing responds to the pointer, and each chapter title fills a whole screen, so the page is 13 to 15 screens tall on a laptop. A dark redesign of the hero and the menu was tried and rejected: it broke 0010, which keeps the hero, the menu and the logo, and the hero no longer fit one screen (1.3 to 2.3 screens tall depending on the device).

## Decision

Keep the hero, the menu and the logo. Polish everything around them:

- **Type:** Geist and Geist Mono (SIL Open Font License), served from `frontend/src/app/fonts/` through `next/font/local`. Nothing is fetched from a font service, at build time or at run time.
- **Texture:** a faint film grain on every chapter, so the gradients feel printed rather than flat.
- **Pointer:** a soft lavender light drifts behind the pointer (`CursorGlow`). It blends with `screen`, so it lights the dark chapters and is invisible on white ones. Nothing is drawn on the cursor itself; a ring and a trail were tried and rejected as distracting. Cards marked with `spotlight` light up under the pointer, with a lit edge (`SpotlightTracker`, one listener for the whole page).
- **Chapter openings:** a labelled chip ("Capítulo 01") instead of a bare number, titles up to about 104 px instead of 150 px, and about three quarters of a screen tall, so the next screen already peeks in.
- **Hero:** the sentence that says what Quintti is grows (up to 24 px, darker ink), so the promise reads right after the name.

The pointer effects run only with a mouse or trackpad and when reduced motion is not requested.

## Consequences

- The hero fits the first screen at 1280x720, 1366x768, 1707x960, 1920x1080 and 390x844, and no width scrolls sideways. The page is 12 to 14 screens tall on a laptop instead of 13 to 15.
- Two font files (about 52 KB) live in the repository with their license.
- The pointer light costs nothing when the pointer is still: the animation stops once it catches up.
- Touch screens and keyboard users see the page without pointer effects, which carry no information.

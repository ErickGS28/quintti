# 7. Design system

> Status: **implemented for the landing page.** The source of truth for values is `frontend/src/app/globals.css`; this document describes the intent. The contrast of every text and background pair is checked by `frontend/src/app/palette-contrast.test.ts`.

## Direction

**Cupertino: calm, clear, light.** Quintti is about money that belongs to a community. The interface should convey order and trust, not noise.

1. **Clarity first.** One primary action per area.
2. **Deference.** Content leads; chrome steps aside.
3. **Subtle depth.** Soft shadows and translucent, blurred bars. No heavy borders.
4. **Human language.** "Tu cuota", "el consejo", not "stakeholders" or "on-chain".
5. **Accessible by default.** AA contrast, 44 px touch targets, reduced motion respected.

The app screens are light only. The landing page uses colored chapters (see "Chapters and tones" below and [decision 0010](decisions/0010-landing-as-colored-chapters.md)). There is no dark mode switch.

## Palette

The five brand colors are fixed. Everything else (tints and ink colors) is derived from them.

| Token | Value | Role |
|-------|-------|------|
| `royal` | `#4525A2` (dark purple) | Titles, links, the main action. Purple also means "approved" and "paid" |
| `lavender` | `#A677CA` | Decoration: gradients, rings, the scrollbar, progress. Never text |
| `periwinkle` | `#ABA7E3` | Decoration: soft fills, selection, small badges. Never text |
| `wine` | `#890C50` (dark magenta) | The problem side: eyebrows, emphasis text, what a rule blocks |
| `coral` | `#EB5F7A` | Fills for the problem side and for a rejected payment. Text on it is `ink` |
| `royal-strong` | `#34187F` | Hover state of `royal`, the bird in the logo |
| `royal-soft`, `periwinkle-soft` | `#EFEAFB`, `#ECEAFA` | Tinted backgrounds for purple elements, secondary buttons |
| `wine-soft`, `coral-soft` | `#FBE7F0`, `#FDE8ED` | Tinted backgrounds for the problem side and rejections; text on the wine and closing chapters |
| `wine-deep` | `#5C0735` | Dark end of the wine chapter gradient |
| `ink`, `ink-soft`, `ink-faint` | `#1D1240`, `#4A4270`, `#5C5486` | Body, supporting and tertiary text |
| `canvas`, `mist`, `cloud` | `#FFFFFF`, `#F6F3FC`, `#FFFFFF` | Page, tinted bands and inner panels, cards |

Rules:

- **Purple is "good", wine and coral are "the problem or the block".** The palette has no green, so approval, payment and success are shown in purple, always with a check mark or the word, never with color alone.
- **Bright colors are not text.** `lavender` and `coral` on white are below 4.5:1, so text uses `royal`, `wine` or `ink`. A test asserts this.
- **Gradients** are the chapter backgrounds, the quiet wash behind the hero and the fill of progress bars. Never on controls.
- **Contrast:** every text and background pair the interface uses reaches at least 4.5:1. The pairs are listed in the test and computed from `globals.css`. They have not been audited with an external tool.

## Typography

Geist for everything and Geist Mono for labels, chapter numbers, fingerprints and figures that line up (SIL Open Font License). The files are in `frontend/src/app/fonts/` and load through `next/font/local`, so nothing is fetched from a font service and the build works offline; the system stack only shows while the font loads. Large titles with tight tracking, few sizes, tabular figures for money.

## Shape, depth and motion

- Large soft corners: `rounded-card` (24 px), `rounded-control` (14 px), pills for navigation and the hero buttons.
- One surface for cards: white, no border, a soft diffuse shadow. A tinted `mist` inner panel for grouped data.
- Short transitions (150 to 500 ms) on color, opacity and transforms. Budget bars grow with a scale transform, not by resizing.
- A faint film grain (`.grain`) on every chapter, so gradients feel printed rather than flat.
- **Spotlight:** cards marked `spotlight` light up under the pointer, a soft fill and a lit 1px edge that follow it (`SpotlightTracker` writes the position, `.spotlight` draws it).
- **Pointer light:** a soft lavender glow drifts behind the pointer (`CursorGlow`). It blends with `screen`, so it shows on dark chapters and disappears on white ones. Nothing is drawn on the cursor itself.
- Pointer effects run only with a mouse or trackpad. `prefers-reduced-motion` turns them and every animation off.

## Logo

The hummingbird in an open ring is unchanged. Only its colors follow the palette: the ring is a gradient from `lavender` to `royal` and the bird is `royal-strong`. The mark spins one turn on hover. The vector in `frontend/src/components/atoms/brand-mark-paths.ts` was traced from the delivered artwork, so its edges are slightly irregular at large sizes. Replace it with the designer's vector when available. `frontend/src/app/icon.svg` is the same mark for the browser tab.

## Page structure

- **Menu:** a floating rounded bar at the top with the section links centered, no button and no logo. On phones only the two links that fit are shown.
- **Hero:** minimal and centered: the mark, the name (its letters come into focus one by one), three words, one sentence and two buttons. Sizes follow the window height so everything fits at any zoom level.
- **The landing page is an argument, told as a stack of full-screen chapters, in this order** (see "Chapters and tones"):
  - *01 The problem* (wine): four everyday situations in frosted cards with a coral icon each.
  - *02 The solution* (royal purple): three rules the account enforces, then four steps of an expense with a small illustration each, horizontal on wide screens and vertical on phones.
  - *03 An example* (mist): a short walk-through of one building where an expense is proposed, signed twice and paid, and a second one is rejected by the budget rule. It is clickable, and it is a simulation with made-up amounts, labelled as such.
  - *04 Why Stellar* (periwinkle): a side-by-side comparison with a normal app, three reasons, and a plain note, on a wine card, about what Stellar does not solve.
  - *Questions* (white) and the *closing* (royal to wine) with the call to action and links to the code and the contract.
- **Honesty on the page:** the problem section says its situations are still being validated, the example says it is illustrative, and the footer says it runs on testnet with no real money and no audit.

## Chapters and tones

Everything below the hero is a **chapter** (`Chapter`), a full-width block with its own gradient. A chapter opens with a **title screen** (`TitleSlide`): a labelled chip with the chapter number ("Capítulo 01"), the chapter name set large (up to about 104 px), one sentence that states the point, big faint ripple rings and a scroll cue. It takes about three quarters of the window, so the next screen already peeks in (decision 0011). Content screens (`Slide`) follow, each at least one window tall with the content centered. Chapters overlap with rounded top corners, like sheets. Scrolling settles on screens with `scroll-snap-type: y proximity`, blocks rise in with a scroll-driven CSS animation, and a pager of dots (`SlideRail`) on the right edge shows the current chapter on large screens.

A **tone** is a CSS class in `globals.css` that sets the gradient and the text colors of everything inside:

| Tone | Chapter | Gradient | Title / text / accent |
|------|---------|----------|-----------------------|
| `tone-wine` | Problem | `wine-deep` to `wine`, coral and royal glows | white / `wine-soft` / `coral-soft` |
| `tone-royal` | Solution | `royal` to `royal-strong`, lavender and coral glows | white / `royal-soft` / `periwinkle` |
| `tone-mist` | Example | `mist` to `periwinkle-soft` | `royal` / `ink-soft` / `wine` |
| `tone-periwinkle` | Stellar | `periwinkle` to `periwinkle-soft`, lavender glow | `royal-strong` / `ink` / `wine` |
| `tone-canvas` | Questions | white to `mist` | `royal` / `ink-soft` / `wine` |
| `tone-finale` | Closing | `royal` to `wine`, lavender and coral glows | white / `royal-soft` / `coral-soft` |

Components read the colors through `text-slide-title`, `text-slide-text`, `text-slide-muted`, `text-slide-accent` and `text-slide-ring`, so they work on any tone. `Card` has three surfaces: `solid` (white, restores the light text colors, readable anywhere), `glass` (frosted, for dark chapters) and `frost` (frosted white, for light colored chapters). The contrast test reads each `.tone-*` block and checks the text colors against both gradient ends.

## Base components

`components/atoms`: BrandMark, BlurInText, Ripple, Button and ButtonLink (with `light` and `glass` variants for dark chapters), Card (with an optional `spotlight`), Badge, Eyebrow (a monospaced label in a hairline pill), PageWash. `components/molecules`: FloatingNav, Chapter, TitleSlide, Slide. `components/organisms`: SlideRail, ScrollToTop, CursorGlow, SpotlightTracker. Pointer math lives in `lib/ui/pointer.ts` and is unit tested. Copy lives in `frontend/src/copy/`, not in the components.
## App screens

The treasury app at `/app` is light only, as decision 0009 set for the app, on a `mist` page with a soft periwinkle light from the top right (`.app-surface`). One app for every role ([decisions/0012](decisions/0012-one-role-aware-app-with-a-sidebar.md)).

- **Frame** (`AppFrame` template): a white sidebar, 18 rem wide, fixed from large screens up, with the brand, a card for the building and the network, six destinations with icons, and the wallet pinned to the bottom. The active item has a royal tint and a small bar on its left edge. On phones and tablets a frosted top bar with the menu, the brand and a compact wallet button replaces it, and the sidebar opens in a drawer built on the native modal dialog.
- **Screens** share one structure: a header (`PageHeader`: title, one sentence, the main action on the right), then titled cards (`Panel`), with a narrow right column for context or the role's form. Figures use `StatCard` (monospaced label, large tabular value), two per row on phones.
- **Lists** are rows with a status disc (royal check for paid, coral cross for cancelled, a clock for pending), the description, the category, vendor and date in one quiet line, and the amount with its state or signatures on the right. A cancelled amount is struck through. The whole row is a link.
- **Addresses** are never bare: `AddressTag` adds a gradient avatar derived from the address (`lib/format/identicon.ts`, hues from purple to coral), a name when the role is known (the assembly and the administration), the shortened address in monospace, and buttons to copy it or open it in the explorer.
- **Forms** use `FormField` (label, control, hint or error, wired with `aria-describedby`), 48 px controls with a hairline ring that turns royal on focus and wine when invalid. The proposal form shows a live checklist of the rules the contract will apply (approved vendor, fits the budget, invoice attached) before anything is signed.
- **Transactions** show their state inline (`TxFeedback`: waiting for the wallet and the network, done with a link to the explorer, or the reason in plain words) and raise a toast when confirmed. A closed wallet prompt is not an error.
- **States:** every screen has a skeleton while the contract is read, an error card with a retry, and an empty state that says what will appear and who makes it appear.
- **Wallet picker:** Stellar Wallets Kit's modal uses the same colors, radius and font (`lib/wallet/wallet-theme.ts`).

## Signature: the ripple

Concentric rings that spread from a point, like a ripple on water or a hovering wing. They echo the open ring of the logo and appear huge and faint behind every chapter title, around the mark in the closing chapter and around the check of a paid receipt. They are decorative, hidden from assistive technology, and become static rings when reduced motion is requested.

## Not done yet

- A contrast audit with an external tool and a keyboard and screen-reader pass.
- The designer's final vector of the logo.

## The manual

`/hiw` is a plain, light page in the same components: a table of contents, the four contract rules, one card per role with what it can and cannot do, the five steps of an expense, a map of the screens, a guide to testing with a wallet next to a live panel of who holds each role in the deployed contract, a glossary and the limits. It is not linked from the app or the landing page and is marked `noindex`; the team shares its address. The text is in `frontend/src/copy/hiw.es.ts`.

# 7. Design system

> Status: **implemented for the landing page.** The source of truth for values is `frontend/src/app/globals.css`; this document describes the intent. The contrast of every text and background pair is checked by `frontend/src/app/palette-contrast.test.ts`.

## Direction

**Cupertino: calm, clear, light.** Quintti is about money that belongs to a community. The interface should convey order and trust, not noise.

1. **Clarity first.** One primary action per area.
2. **Deference.** Content leads; chrome steps aside.
3. **Subtle depth.** Soft shadows and translucent, blurred bars. No heavy borders.
4. **Human language.** "Tu cuota", "el consejo", not "stakeholders" or "on-chain".
5. **Accessible by default.** AA contrast, 44 px touch targets, reduced motion respected.

The app screens are light only. The landing page is a presentation of calm screens with one deep purple one (see "Chapters and tones" below and [decision 0015](decisions/0015-landing-as-a-calm-presentation.md)). There is no dark mode switch.

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
| `wine-soft`, `coral-soft` | `#FBE7F0`, `#FDE8ED` | Tinted backgrounds for the problem side and rejections |
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
- **Spotlight:** cards marked `spotlight` light up under the pointer, a soft fill and a lit 1px edge that follow it (`SpotlightTracker` writes the position, `.spotlight` draws it).
- Pointer effects run only with a mouse or trackpad. `prefers-reduced-motion` turns them and every animation off.

## Logo

The hummingbird in an open ring is unchanged. Only its colors follow the palette: the ring is a gradient from `lavender` to `royal` and the bird is `royal-strong`. The mark spins one turn on hover. The vector in `frontend/src/components/atoms/brand-mark-paths.ts` was traced from the delivered artwork, so its edges are slightly irregular at large sizes. Replace it with the designer's vector when available. `frontend/src/app/icon.svg` is the same mark for the browser tab.

## Page structure

- **Menu:** a floating rounded bar at the top with the section links centered, no button and no logo. On phones only the two links that fit are shown.
- **Hero:** minimal and centered: the mark, the name (its letters come into focus one by one), three words, a sentence that says what Quintti is ("the shared account of your building"), two buttons and a "Powered by Stellar" tag. Sizes follow the window height so everything fits at any zoom level.
- **The landing page is a presentation: one idea per screen** (see "Chapters and tones"). A label, one statement and a supporting sentence, centered, then the content:
  - *The problem* (rose): a worked example of how much money one building moves, four things a resident thinks (one card each) and a closing line.
  - *The solution* (deep purple), two screens: the three rules the account enforces, then the four steps of an expense with a small illustration each.
  - *An example* (mist): a short walk-through of one building where an expense is proposed, signed twice and paid, and a second one is rejected by the budget rule. It is clickable and labelled "Simulación con valores ilustrativos".
  - *Why Stellar* (lilac), two screens: a side-by-side comparison with a normal app, then three reasons.
- **What the landing page leaves out:** no hackathon, no links to the code or the contract, no FAQ, no closing call to action, and none of the limits (those are in the manual at `/hiw` and in the docs). The footer is one line that says it is a prototype on testnet and a transparency tool, not a substitute for the assembly or the law.
## Chapters and tones

Everything below the hero is a **chapter** (`Chapter`): one screen, at least one window tall (`min-h-dvh`), its content centered, with a quiet gradient of its own. A chapter has no overlap, no grain and no giant title: it opens with a small label, a statement of about 60 px at most and one sentence (`ScreenHeading`). The content is sized with the window height so that every screen fits at 1280x720 and even at 1366x650; on windows shorter than 800 px (the `short` variant in `globals.css`) the supporting sentence, the label of the denser screens and the last row of the comparison are dropped. On a phone, where the content is taller than the window, a screen simply grows.

Scrolling works like a presentation: on a laptop or larger with a mouse or trackpad, `scroll-snap-type: y mandatory` settles on each screen; elsewhere it is `proximity`, so tall content is never trapped. A zero-height snap point at the top lets the page rest on the hero. Blocks rise in with a scroll-driven CSS animation, and a pager of dots (`SlideRail`) on the right edge shows the current screen. Reduced motion turns all of it off.

The page is light except for one deep screen, so no two saturated colors ever sit next to each other. A **tone** is a CSS class in `globals.css` that sets the gradient and the text colors of everything inside:

| Tone | Screen | Gradient | Title / text / accent |
|------|--------|----------|-----------------------|
| `tone-rose` | Problem | white to `coral-soft`, faint coral and lavender glows | `ink` / `ink-soft` / `wine` |
| `tone-royal` | Solution (two screens) | `royal` to `royal-strong`, lavender and periwinkle glows | white / `royal-soft` / `periwinkle` |
| `tone-mist` | Example | `mist` to `periwinkle-soft` | `royal` / `ink-soft` / `wine` |
| `tone-lilac` | Stellar (two screens) | `periwinkle-soft` to white | `royal` / `ink-soft` / `wine` |

Components read the colors through `text-slide-title`, `text-slide-text`, `text-slide-muted`, `text-slide-accent` and `text-slide-ring`, so they work on any tone. `Card` has two surfaces: `solid` (white, restores the light text colors, readable anywhere) and `glass` (frosted, for the deep screen). The contrast test reads each `.tone-*` block and checks the text colors against both gradient ends.

## Base components

`components/atoms`: BrandMark, BlurInText, Ripple, Button and ButtonLink (with `light` and `glass` variants), Card (with an optional `spotlight`), Badge, Eyebrow (a monospaced label in a hairline pill), PageWash. `components/molecules`: FloatingNav, Chapter, ScreenHeading. `components/organisms`: SlideRail, SpotlightTracker. Pointer math lives in `lib/ui/pointer.ts` and is unit tested. Copy lives in `frontend/src/copy/`, not in the components.
## App screens

The treasury app at `/app` is light only, as decision 0009 set for the app, on a `mist` page with a soft periwinkle light from the top right (`.app-surface`). One app for every role ([decisions/0012](decisions/0012-one-role-aware-app-with-a-sidebar.md)).

- **Frame** (`AppFrame` template): a white sidebar, 18 rem wide, fixed from large screens up, with the brand, a card for the building and the network, three destinations with icons (Resumen, Gastos, Reglas), and the wallet pinned to the bottom. The active item has a royal tint and a small bar on its left edge. On phones and tablets a frosted top bar with the menu, the brand and a compact wallet button replaces it, and the sidebar opens in a drawer built on the native modal dialog.
- **Screens** share one structure: a header (`PageHeader`: title, one sentence, the main action on the right), then titled cards (`Panel`), with a narrow right column for context or the role's form. Figures use `StatCard` (monospaced label, large tabular value), two per row on phones.
- **Lists** are rows with a status disc (royal check for paid, coral cross for cancelled, a clock for pending), the description, the category, vendor and date in one quiet line, and the amount with its state or signatures on the right. A cancelled amount is struck through. The whole row is a link.
- **Addresses** are never bare: `AddressTag` adds a gradient avatar derived from the address (`lib/format/identicon.ts`, hues from purple to coral), a name when the role is known (the assembly and the administration), the shortened address in monospace, and buttons to copy it or open it in the explorer.
- **Forms** use `FormField` (label, control, hint or error, wired with `aria-describedby`), 48 px controls with a hairline ring that turns royal on focus and wine when invalid. The proposal form shows a live checklist of the rules the contract will apply (approved vendor, fits the budget, invoice attached) before anything is signed.
- **Transactions** show their state inline (`TxFeedback`: waiting for the wallet and the network, done with a link to the explorer, or the reason in plain words) and raise a toast when confirmed. A closed wallet prompt is not an error.
- **States:** every screen has a skeleton while the contract is read, an error card with a retry, and an empty state that says what will appear and who makes it appear.
- **Wallet picker:** Stellar Wallets Kit's modal uses the same colors, radius and font (`lib/wallet/wallet-theme.ts`).

## Signature: the ripple

Concentric rings that spread from a point, like a ripple on water or a hovering wing. They echo the open ring of the logo and appear around the check of a paid receipt. They are decorative, hidden from assistive technology, and become static rings when reduced motion is requested.

## Not done yet

- A contrast audit with an external tool and a keyboard and screen-reader pass.
- The designer's final vector of the logo.

## The manual

`/hiw` is a plain, light page in the same components: a table of contents, the four contract rules, one card per role with what it can and cannot do, the five steps of an expense, a map of the screens, a guide to testing with a wallet next to a live panel of who holds each role in the deployed contract, a glossary and the limits. It is not linked from the app or the landing page and is marked `noindex`; the team shares its address. The text is in `frontend/src/copy/hiw.es.ts`.

`/negocio` is the business model and the plan after the hackathon, built like the landing page (four one-window screens in the royal, lilac, mist and royal tones, with the same menu and pager): what a building moves against what it pays, the sources of income, the steps ahead and how they are measured. It is not linked from the landing page and is marked `noindex`. The figures are illustrative and labelled as such. The text is in `frontend/src/copy/negocio.es.ts`.

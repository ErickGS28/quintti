# Changelog

Notable changes to Quintti, newest first. The project has no versioned releases yet, so entries are grouped by date. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Current state

Updated: 25 November 2026.

| Area | State |
|------|-------|
| Product documentation | Written: idea, vision, product and flows, contract design, architecture, risks, getting started, design system, 16 decisions |
| Treasury contract | Implemented and unit tested (109 tests), with an optional delay on council rotation, the building's name and a description and invoice link per expense. Development deployment on Stellar testnet |
| Web app: non-visual foundation | Built and tested (240 offline tests, 6 optional live tests against testnet): validated configuration, generated contract bindings, transaction layer, wallet adapter, input validation, Spanish error messages, treasury reader, expense and governance services, wallet session, query hooks |
| Web app: landing page | A presentation, one idea per screen and one window tall, in calm tones: the hero, the problem, the solution (two screens), a clickable example and why Stellar (two screens). No hackathon, code links or FAQ. Every screen fits at 1280x720 and 1366x650; on a phone they grow with their content |
| Web app: treasury app | Three screens at `/app`, checked in a browser against the development treasury on testnet: Resumen, Gastos (list, detail with approvals and invoice check, propose, approve, cancel) and Reglas (budget, vendors, who decides). Same flow for every role; the connected wallet decides the buttons |
| Manual | A hidden page at `/hiw`: the contract's rules, each role with what it can and cannot do, the flow of an expense, a map of the screens, a guide to testing with a wallet and a live panel of who holds each role in the deployed contract |
| Business model and plan | A hidden page at `/negocio`: subscription per building, three sources of income, a four-step plan from validation to a first real building, and the metrics that follow it. Figures are assumptions to validate |
| Visual design | Defined: light Cupertino direction, the five-color purple palette, tokens in one file. The logo is a traced vector, to be replaced by the designer's file |
| Real wallet signing | Done with Varial (Freighter) on testnet: connect, propose, approve and pay with real signatures. The picker is themed |
| Contract evidence on testnet | Done: a demo deployment with Spanish categories and a full paid expense, seeded by `scripts/seed-demo.ps1`, with every transaction linked from the README |
| Collective assembly | A 2-of-3 multi-signature account as the assembly and a delay on council rotation, both shown on testnet ([decision 0017](docs/decisions/0017-a-collective-assembly.md)). The web app does not offer rotations yet |
| Audit | None. Testnet only, not for real funds |

What works today, verified on testnet:

- Contract, through the command line and through the web foundation: setting a budget and approved vendors, a deposit, an expense proposal, council approvals that pay the vendor at the threshold, and rejections for a payment above the category limit and for an approval by a non-council member.
- Web foundation, against a real treasury: reading the configuration, balance, budget lines, vendors and the full expense history with its invoice fingerprint and approvals, and seeing an over-budget proposal rejected with the right rule name before any signature is requested.

Known limits are in [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md). How to run everything is in [docs/06-getting-started.md](docs/06-getting-started.md).

Demo deployment (temporary, the testnet is reset periodically; its transactions are linked from the README):
`CA7DWVPW2JWFZ7KSVGLCLFDXD7HZOY7HL7274UZW4ZQZBJCQSHQ4U237`.

## Unreleased

### Changed
- The constructor takes a seventh argument, `name`, and `propose_expense` two more. `seed-demo.ps1`, `deploy-treasury.ps1` (which now needs `-Name`) and `demo-multisig-assembly.ps1` pass them. The treasury the Netlify demo site was built against has the previous interface; it keeps working until the site is rebuilt, and then it must be rebuilt against the new treasury.
- The web app's configuration accepts `mainnet` (it used to reject it). The wallet-on-another-network message no longer names testnet, because the right network now depends on the build: it asks for the network the app shows.
- The constructor takes a sixth argument, `rotation_delay`. `scripts/seed-demo.ps1` passes zero, so the demo treasury behaves as before.
- The landing page is cut to four screens for the recorded walkthrough: the hero, the problem, how an expense flows ("Así fluye un gasto", the four roles) and why Stellar (the comparison). The three-rules screen, the clickable example and the "Lo que cambia" screen are commented out in `LandingPage`, `LandingNav` and `WhyStellarSection`, not deleted. The top menu was removed from both pages (the dots on the right edge remain), the hero is now one full window tall and its single button goes to the problem screen. `/negocio` keeps two screens, income and plan; the model and follow-up screens are in the history (commit `44237e0`).

### Added
- Deposits from the app, [decision 0020](docs/decisions/0020-deposits-and-errors-from-other-contracts.md). A **Depositar fondos** button in the overview opens `/app/depositar`: any account with a wallet can pay into the treasury, with no role. The form shows what the payer holds (read from the token) and what the treasury would hold afterwards, and checks the amount before asking for a signature. On a building opened from a link and not saved there is no amount field and no button, and the write hook refuses too. The manual no longer says the app has no deposit screen. 19 new tests (308 in total). A deposit of 1 XLM was made for real on testnet with a key in memory, moving a building from 0 to 10,000,000 stroops. **Not tried with a browser wallet extension.**
- Errors are attributed to the contract that raised them. A deposit from an account with too little failed inside the **token** with `Error(Contract, #10)`, which in the treasury's table is `VendorNotApproved`: the person would have read "that vendor is not approved". The app now reads the diagnostic events, and an error raised by another contract becomes the new kind `other-contract` with its code instead of being looked up in the treasury's table. Only codes seen on the network for XLM's token are named (10, not enough balance; 12, amount too large). Checked against testnet, and the tests fail if the comparison is removed.
- Several buildings in one app, with no backend, [decision 0019](docs/decisions/0019-buildings-by-link-without-a-backend.md). The building is chosen by the link, `/app/?edificio=C...`, and every link inside the app keeps it. A list of the buildings a person saved lives in their browser, and a new screen, **Mis edificios** (reached from the building card), shows it with each building's name read from the chain, a button to copy its link and a form to add one by link or address. A building opened from a link is **read-only until it is saved**: the notice shows its address, roles are not computed and the write hooks refuse with the new error kind `untrusted-building`, because a link can point at a contract that only looks like a building. A broken link shows its own page instead of the main building. The reading hooks and cache keys are per contract; `/hiw` still shows the configured building. 30 new tests (289 in total). Seen working in a browser on testnet with two buildings. How to use it: [docs/12-buildings-and-links.md](docs/12-buildings-and-links.md).
- A second testnet building with no data, `CC2NVO7Z4BVRTHJG34EDFF5JLHBBRJXKOLUYVUL5DFGO4RA7D5VS4I52`, to try switching.
- The building's name and the words of an expense, on-chain, so a pilot needs no database. The constructor takes a `name` (and `set_name` and `get_name` read and fix it). `propose_expense` takes a required `description` and an optional `invoice_uri`. Limits are in bytes (80, 200, 200). New errors 24 `TextTooLong` and 25 `EmptyText`. 14 new contract tests (109 in total). The app shows the name in the sidebar and the overview, the description as the title of each expense, and a link to the invoice that only opens `http` and `https` addresses, because the contract limits the length of the text but not its scheme. The propose form asks for both. 13 new frontend tests (259 in total).
- A new demo treasury on testnet, `CCHMX7JMZ7XVKURSR55FSM5MT5SOZOPNTFYQ6SSL5YIIRXKNN5FA5QDP`, with the new interface; the generated bindings come from it and the README table lists its transactions.
- [docs/11-shipit-mainnet-plan.md](docs/11-shipit-mainnet-plan.md): the step-by-step plan to launch on mainnet for the Ship It challenge only. It is optional and undecided, and the normal development of the product follows [docs/09-state-and-next-steps.md](docs/09-state-and-next-steps.md).
- Mainnet as an opt-in beta, decision [0018](docs/decisions/0018-mainnet-as-an-opt-in-beta.md). The web app can be built for mainnet with `NEXT_PUBLIC_STELLAR_NETWORK=mainnet`, which requires an https `NEXT_PUBLIC_SOROBAN_RPC_URL` because the SDF runs no public RPC there. The sidebar, the landing footer and the manual say it is an unaudited beta and no longer claim there is no real money. The default stays testnet. 6 new tests. Nothing is deployed on mainnet.
- `scripts/deploy-treasury.ps1`: deploys a treasury with the roles you give it. It only shows the plan and an estimate unless it gets `-Execute`, and on mainnet it asks for the word MAINNET. [docs/10-mainnet-launch.md](docs/10-mainnet-launch.md) is the guide.
- [docs/09-state-and-next-steps.md](docs/09-state-and-next-steps.md)(docs/09-state-and-next-steps.md): the state, the gaps between the code and the deployed demo, and what comes next, so the work can resume without the conversation that produced it.
- `CONTRIBUTING.md` with the branch model (`main` and `dev` kept equal, fast-forward only), the commit style and the checks to run before pushing. The CI also runs on `dev` and `shipit`.
- CI on every push and pull request (`.github/workflows/ci.yml`): format, lint and tests for the contract, and lint, types, tests and the static build for the web app. The build uses `.env.example` as its configuration.
- A collective assembly, decision [0017](docs/decisions/0017-a-collective-assembly.md). The assembly can be a Stellar multi-signature account (2 of 3 representatives); `scripts/demo-multisig-assembly.ps1` shows on testnet that one signature is refused and two are accepted.
- A delay on council rotation. The constructor takes `rotation_delay` (seconds, zero for none). With a delay, `rotate_council` is refused with `RotationDelayRequired` and the assembly uses `announce_rotation`, `execute_rotation` and `cancel_rotation`; `get_pending_rotation` and `get_rotation_delay` read the state. New errors 20 to 23 and events `RotationAnnounced` and `RotationCancelled`. 17 new tests (95 in total). The existing demo deployment and the web app's generated bindings are unchanged; the web app does not offer rotations.
- A two-minute demo walkthrough, [docs/08-demo-walkthrough.md](docs/08-demo-walkthrough.md).
- A hidden page at `/negocio` for the business model and the plan after the hackathon, in the landing page's style (one-window screens): what a building pays against what it moves (a $2.000 per apartment subscription against $12.000.000 a month, under 1 %), the three sources of income, the four steps of the plan (validate, pilot, complete, production) and what is done first and how it is measured. The figures are illustrative and the page says so. Not linked from the landing, `noindex`. Its text is in `copy/negocio.es.ts`, with a test of the arithmetic behind the sentences.

## 2026-11-08 (recording day)

### Fixed
- The proposal form now also checks that the treasury holds the amount (a fourth item, "Hay saldo en la cuenta", and a message if it does not). Before, a proposal could fit its category's budget but exceed the balance, and the contract only rejected it at the second approval, when it tried to pay.

### Changed
- The landing hero now says what Quintti is ("Quintti es la cuenta compartida de tu edificio…") and carries a "Powered by Stellar" tag.
- The problem screen gives context instead of loose words: a worked example (a $300.000 fee in a 40-apartment building is $12.000.000 a month in one account), titles written as what a resident thinks, and a closing line. It keeps its supporting sentence on short windows, and every screen still fits at 1440x900, 1280x720 and 1366x650.
- A fresh demo treasury was seeded for the final recording (see the README); the previous one stays for rehearsals.

## 2026-11-08 (night)

### Changed
- The app went from six screens to three (decision 0016): Resumen, Gastos and Reglas. Budget, vendors and who decides are now one screen, Reglas, where the assembly also finds the forms to change the budget and the vendors.
- The invoice check moved into each expense: drop the original file and its fingerprint is compared with the one on-chain. It now compares a single fingerprint.
- Fewer words everywhere: the app's page descriptions, hints and repeated explanations, the landing page's leads and cards, and the manual (`/hiw`), which now describes the three screens and says what the app does not offer.
- The overview lost its budget panel (it lives in Reglas) and its invoice card. The rejected expense in the landing example shows a single line.

### Removed
- The screens Presupuesto, Proveedores, Consejo y roles and Verificar factura (`/app/presupuesto`, `/app/proveedores`, `/app/consejo`, `/app/verificar`), the forms to replace the administrator and to renew the council, and the multi-expense invoice matching and its tests. The contract, services and hooks for those actions stay.
## 2026-11-08 (late)

### Changed
- The landing page below the hero was redesigned (decision 0015) as a presentation: one idea per screen, each one window tall, with scrolling that settles on every screen on a laptop or larger. Each screen is a small label, a statement and a supporting sentence, centered, then its content. The problem is a faint rose, the example is mist, Stellar is lilac, and the solution is the one deep purple screen, so saturated colors no longer sit next to each other. The sizes follow the window height and the screens drop their extras below 800 px, checked at 1440x900, 1280x720 and 1366x650.
- The solution and Stellar each take two screens (the rules, then the flow; the comparison, then the three reasons). The example is more compact, its ledger lines are shorter and the explanation of the rejected expense moved into the caption, so the layout does not jump between steps.
- The landing page now speaks as a product: no hackathon, no links to the code or the contract, no FAQ and no closing call to action. The example is labelled as a simulation and the footer is one line.

### Removed
- The arrow under each title, the large rings behind it, the film grain, the light that follows the pointer, the scroll-to-top button, the overlapping sheets, and the wine, periwinkle, canvas and finale tones. `TitleSlide`, `Slide`, `CursorGlow`, `ScrollToTop`, the FAQ and closing screens, the contract link and the pointer-follow math were deleted. The card spotlight and Geist stay.

### Added
- `ScreenHeading`, the `rose` and `lilac` tones and a `short` variant for windows under 800 px high. The contrast test covers the four tones. A copy test keeps the hackathon and the repository out of the landing page.
## 2026-11-08

### Added
- The treasury app at `/app`, one app for every role (decision 0012): overview with balance, budget used, pending expenses, signatures needed, budget lines, latest expenses, the role of the connected wallet and who decides; the expense list with filters; each expense with its details, invoice fingerprint, council approvals counted like the contract counts them, invoice check, and approve or cancel; proposing an expense with a live checklist of the rules; budget, vendors, and council and roles, each with the assembly's forms. Every screen has loading, error and empty states.
- Sidebar navigation with the building, the network and the wallet; a top bar and a drawer on phones; toasts when a transaction is confirmed.
- Stellar Wallets Kit's picker in Quintti's colors and font.
- Shared components following atomic design: inputs, select, textarea, avatar, progress bar, spinner, skeleton, icon button; form field, page header, panel, stat card, detail list, address tag, file drop, segmented control, transaction feedback, empty and error states; sidebar, mobile bar, drawer, toaster; and the app frame.
- A link from the landing page's closing chapter to the app.
- Geist and Geist Mono, served from the repository through `next/font/local` with their license.
- A soft light that drifts behind the pointer and lights the dark chapters, and cards that light up under the pointer with a lit edge. Mouse and trackpad only, off with reduced motion.
- A faint film grain on every chapter, an `Eyebrow` label and unit tests for the pointer math.
- The manual at `/hiw`, a hidden page (not linked from anywhere, `noindex`) that explains the contract's rules, the five roles, the flow of an expense, the screens and how to test with a wallet, with a live panel of who holds each role in the deployed contract. Its text is in `copy/hiw.es.ts`.
- Unit tests for roles, approval progress, identicons, toasts, transaction feedback, invoice matching and the manual's copy (255 offline tests in total).
- Decisions 0011, 0012 and 0014.

### Changed
- The hero's sentence that says what Quintti is is larger and darker, so the promise reads right after the name. The hero, the menu and the logo keep their design (decision 0010).
- Chapter openings show a labelled chip ("Capítulo 01"), a title up to about 104 px instead of 150 px, and take about three quarters of a screen, so the page is shorter.

### Removed
- The off-chain records: the Supabase database and file bucket, the `/api` routes, the server configuration and the ESLint rule that guarded the secret key (decision 0014, which supersedes 0013 and restores 0007). The app reads only the contract; the work stays in the history of the branch `feat/treasury-app`.
- The description, vendor name and invoice download on the expense pages; the proposal form no longer asks for a description.

### Fixed
- `npm run typecheck` generates Next.js's route types first, so it passes on a fresh clone instead of failing on `LayoutProps`.

## 2026-11-07 (night)

### Changed
- The landing page below the hero was redesigned as a stack of full-screen chapters, each on its own gradient so the whole palette is used: wine for the problem, royal purple for the solution, mist for the example, periwinkle for Stellar, white for the questions and royal to wine for the closing. The hero, the menu and the logo are unchanged.
- Each chapter opens with a title screen: the chapter name very large and centered (up to about 150 px), one sentence with its point, a chapter number, big faint ripple rings and a scroll cue. Body text and cards are larger.
- Scrolling settles on screens (CSS scroll snapping, `proximity`), blocks rise in with a scroll-driven animation (no script), and a pager of dots on the right edge shows the current chapter on large screens.

### Added
- `Chapter`, `TitleSlide`, `Slide` and `SlideRail` components, `light` and `glass` button variants, `glass`, `frost` and `solid` card surfaces, and the `wine-deep` token.
- Tone variables in `globals.css` and a contrast test that reads every tone and checks the text colors against both ends of its gradient (211 offline tests in total).
- Decision 0010 and an updated design system document.

### Removed
- `SectionHeading`, replaced by `TitleSlide`.

## 2026-11-07 (evening)

### Added
- Landing page (`features/landing`), told as an argument: the problem in four everyday situations, the solution as three rules and four illustrated steps, a clickable example (a building where an expense is proposed, signed twice and paid, and a second one is rejected by the budget rule), a side-by-side comparison with a normal app, three reasons for Stellar, an honest note about what Stellar does not solve, questions, and a closing call to action with links to the code and the contract.
- Design system: Tailwind 4.3.5, tokens in `globals.css`, base components (`BrandMark`, `Button`, `Card`, `Badge`, `Ripple`, `FloatingNav`, `SectionHeading`, `ScrollToTop`) and the favicon. The logo keeps its shape and takes the new palette.
- A test that computes the contrast of every text and background pair from `globals.css` and fails below 4.5:1.
- A tested state machine behind the example, which applies the same budget rule as the contract.
- Design document `docs/07-design-system.md` and decision 0009.

### Notes
- The example on the page is a simulation with made-up amounts and says so. The problem section says its situations are still being validated with administrators and residents.
- The page makes no network request. The link to the contract appears only when a contract ID is configured.

## 2026-11-07

### Added
- Web app foundation (`frontend/`, Next.js 16.4.5, React 19.3.0, TypeScript 5.9.3 strict, `@stellar/stellar-sdk` 17.4.0, Stellar Wallets Kit 2.8.0, TanStack Query 5.107.1, Vitest 5.1.0), all dependencies pinned:
  - Validated environment configuration for testnet and a local network. Mainnet is rejected.
  - TypeScript bindings generated from the deployed contract, and `npm run bindings` to regenerate them.
  - Transaction layer: a treasury client, `readResult` / `readValue` / `sendAndConfirm`, bounded confirmation, and explorer links.
  - One error type, `AppError`, with nine kinds, and a mapping from the contract's 19 errors to their names. A test checks the mapping against the generated bindings.
  - Spanish messages for every error, in a separate `copy/` folder. The message table is typed so a new contract error cannot be added without one.
  - Wallet adapter on Stellar Wallets Kit, loaded on demand, with a network check before signing.
  - Input validation (category, address, amount, whole numbers, invoice file) and amount, address and date formatting that use integers only.
  - Invoice fingerprint: SHA-256 of a file in the browser, and a check of a file against a stored fingerprint.
  - Services to propose, approve and cancel expenses and to manage budget, vendors, administrator and council.
  - A treasury reader that rebuilds the balance, budget lines, council, vendors and the whole expense history from contract state.
  - A wallet session store and a hook, query hooks for reads and mutation hooks for writes, and the query provider.
  - ESLint rules that enforce the layer boundaries.
  - Optional tests against a real treasury on testnet (`src/live/`).
- Getting started guide, this changelog, and decision 0008.
- Treasury contract (`contracts/treasury`, `soroban-sdk` 29.0.1):
  - Constructor that fixes the token, the assembly, the administrator, the council and the threshold.
  - Budget lines per category and an approved vendor list, both managed by the assembly.
  - Expense proposals by the administrator with the invoice fingerprint, and a paginated expense history.
  - Council approvals. The approval that reaches the threshold rechecks the rules and pays the vendor, updating state before the transfer.
  - Expense cancellation by the administrator or the assembly.
  - Administrator replacement and council rotation by the assembly. Approvals from removed members stop counting.
  - Deposits that record who paid.
  - Self-dealing guard: the assembly, the administrator and council members cannot be paid as vendors.
- 78 contract unit tests covering the happy paths, every error variant, boundaries, authorization (by signer and without mocked authorization), fund conservation and the category limit.
- Product and architecture documentation with design decisions 0001 to 0007.
- Development deployment on Stellar testnet and a full expense cycle run from the command line.

### Changed
- The contract uses a constructor instead of an `initialize` function, so there is no window to initialize it twice.
- Design documents were aligned with the implementation.

### Fixed
- The generated client reports a contract rejection with the Rust documentation text and drops the error code. The transaction layer now reads the simulation's own error, so the right rule is named and the wallet is never asked to sign a call that already failed (decision 0008).

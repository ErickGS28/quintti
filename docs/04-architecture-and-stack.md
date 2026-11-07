# 4. Architecture and stack

## Overview

```
 Administrator ─┐
 Council ───────┼─► Web app (Next.js) ──► Wallet (signs) ──► Soroban RPC ──► Treasury contract ──► Token contract (USDC / test token)
 Assembly ──────┘          │                                                        ▲
                           │                                                        │
 Residents (no wallet) ────┴──── read-only calls (simulation) ─────────────────────┘
```

There is **no custom backend**. The browser talks to the Soroban RPC. State lives in the contract. Invoice files are hashed in the browser, and only the fingerprint goes on-chain ([decisions/0005](decisions/0005-invoice-hash-on-chain.md), [decisions/0007](decisions/0007-no-backend.md)).

## Components

| Component | Technology | Notes |
|-----------|-----------|-------|
| Contract | Rust + `soroban-sdk` 29.0.1 (pinned) | See [03-contract-design.md](03-contract-design.md) |
| Access control and utilities | None: two stored roles checked with `require_auth` | OpenZeppelin Stellar Contracts was evaluated and not used. The role model is two addresses plus a council, so a library would add more surface than it removes |
| CLI and deployment | Stellar CLI | Build, deploy and invoke on testnet |
| Frontend | TypeScript 5.9.3 (strict) + Next.js 16.4.5 (App Router) + React 19.3.0 | Per `toolkit/playbooks/frontend.md`. Node 22.12 or newer |
| Wallet | `@creit.tech/stellar-wallets-kit` 2.8.0 | Multi-wallet connection and signing, loaded on demand in the browser. The kit lists Freighter under its new name, Varial. Not yet tried with a real wallet extension |
| Client SDK | `@stellar/stellar-sdk` 17.4.0 and generated contract bindings | Simulate, sign, submit, read state |
| Data and tests | `@tanstack/react-query` 5.107.1, Vitest 5.1.0, ESLint 9.39.5 | Cached reads and mutations. Unit tests run offline |
| Styling and icons | Tailwind CSS 4.3.5 (PostCSS), `lucide-react` 1.70.0 | Tokens in `globals.css`. Icons are SVG, never emoji |
| Invoice fingerprint | Web Crypto API (SHA-256) in the browser | No server involved |
| Token | Testnet USDC (SAC) or an own test token | One controlled token for the core flow. See limits below |
| Explorer | stellar.expert | Every flow links to its transactions |
| Hosting | Vercel or Netlify | Public URL for the demo |

Verified on 7 November 2026: Rust 1.99.1, `soroban-sdk` 29.0.1 (pinned; the latest stable, the 30 line is still a release candidate), Stellar CLI 30.0.1, and the public testnet RPC at protocol 30. Frontend dependencies are pinned to exact versions in `frontend/package.json`; the ones that matter are listed above.

## Repository structure

Layering follows `toolkit/AGENTS.md` (feature-based plus atomic design). If they differ, that document prevails.

```
quintti/
├── README.md · CHANGELOG.md
├── docs/                          this documentation
│   └── decisions/                 design decisions
├── contracts/
│   └── treasury/src/              lib.rs · types.rs · errors.rs · events.rs · storage.rs · logic.rs · payment.rs · test/
├── frontend/
│   ├── scripts/                   generate-bindings.mjs
│   └── src/
│       ├── app/                   routes and the query provider, composition only
│       ├── features/              one folder per capability, each with an index.ts
│       │   ├── landing/           the presentation page: chapters, illustrations and the clickable example
│       │   ├── public-view/       reads the treasury state for the resident view (services, hooks, types)
│       │   ├── expenses/          propose, approve and cancel expenses
│       │   ├── governance/        budget, vendors, administrator and council
│       │   └── wallet-session/    who is connected: a store and a hook
│       ├── components/            atoms, molecules and organisms shared by every screen
│       ├── copy/                  Spanish user-facing text (landing page and error messages), isolated from logic
│       ├── lib/
│       │   ├── errors/            AppError, the one error type that leaves lib
│       │   ├── stellar/           treasury client, transaction service, error mapping, explorer links
│       │   ├── wallet/            wallet adapter, Wallets Kit implementation, network check
│       │   ├── treasury/          input validation, the connected-wallet write flow, cache keys, retry policy
│       │   ├── hash/              invoice SHA-256
│       │   ├── ui/                class-name helper
│       │   └── format/            amounts, dates, addresses
│       ├── contracts/generated/   bindings, never edited by hand
│       ├── config/                validated environment and constants
│       ├── test-support/          fakes shared by tests, never imported by app code
│       └── live/                  optional tests against a real treasury on testnet
└── scripts/                       deployment and demo data (not built yet)
```

Layer rules, enforced by ESLint (`frontend/eslint.config.mjs`), imports go downward only: `app → features → components and copy → lib and config → contracts/generated`.

- `lib` and `config` cannot import `features`, `app`, `components` or `copy`.
- A feature cannot import another feature or `app`. Shared code moves to `lib`.
- `app` and `components` import a feature only through its `index.ts`.
- Only `lib/stellar` and `lib/wallet` talk to the SDK or the wallet library.

`components/` holds the shared interface pieces: atoms (BrandMark, Button, Card, Badge, Ripple, BlurInText, PageWash), molecules (FloatingNav, Chapter, TitleSlide, Slide) and organisms (SlideRail, ScrollToTop). Templates are not created yet because only one page exists.
The visual direction, palette and components are in [07-design-system.md](07-design-system.md). Colors, typography and spacing live in one place, `frontend/src/app/globals.css`, so changing the brand is a change in one file. Styling uses Tailwind 4.3.5 with those tokens, and the Spanish text of the landing page is in `frontend/src/copy/landing.es.ts`.

## Technical flow of a transaction

1. The caller builds the contract call with the generated client (`lib/stellar/treasury-client.ts`).
2. Building it **simulates** the call. `sendAndConfirm` then checks the simulation result itself before anything else, and stops with the contract's error if the network rejected the call. The wallet is never asked to sign a call that is known to fail.
3. The wallet signs. A closed or refused prompt is an `AppError` of kind `wallet-rejected`, a normal outcome and not an error screen.
4. The transaction is sent and its status polled until it is final or `TRANSACTION_TIMEOUT_SECONDS` (60) runs out. A timeout is reported as such, with the advice to check the explorer before repeating.
5. Mutations refresh every cached read (`treasuryKeys.all`), and the result carries the transaction hash and an explorer link.

Components never build, sign or submit transactions. They call feature hooks, which call feature services, which call `executeWrite` in `lib/treasury`.

```
component → hook → feature service → executeWrite → connectedSigner (wallet is connected and on the right network)
                                                  → sendAndConfirm → generated client → RPC
```

### One error type

Everything that leaves `lib/` is an `AppError` with a `kind`: `contract`, `invalid-input`, `wallet-rejected`, `wallet-unavailable`, `wallet-network`, `network`, `timeout`, `state-expired` or `unknown`. Screens never inspect SDK or wallet errors. For `contract` errors, `contractError` holds the name of the rule (for example `OverBudget`), and `copy/errors.es.ts` has a Spanish message for each of the 19. A test compares the list of names with the generated bindings, and the message table is typed as `Record<ContractErrorName, string>`, so a new contract error cannot be added without a message.

See [decisions/0008](decisions/0008-read-simulation-errors-directly.md) for why the simulation error is read directly.

## Reading the public view

The public view calls the contract's read functions through simulation (no signature, no account). `createTreasuryReader` rebuilds the snapshot (balance, budget lines, council, vendors) and the whole expense history from contract **state** (`expense_count`, `get_expenses` in pages of 20), not from events, because RPC event retention is limited (*to verify*). Amounts stay as `bigint` and the invoice fingerprint as hexadecimal.
## Technical decisions

- **No backend.** There is nothing that needs a secret in the prototype. A server route is added only if an anchor or relayer key becomes necessary.
- **One controlled token.** Testnet assets are fragmented, so the core flow uses a single token. Anything simulated is stated openly.
- **Several signers in a demo.** The flow needs the administrator and at least two council members. Switching wallet accounts live is fragile, so the demo uses a documented approach: a real wallet for the main signer and throwaway testnet keys for the others, clearly labelled. The final choice is recorded as a decision here once the demo is built.
- **Prepared demo data.** Funded accounts, a seeded treasury, budget lines and vendors, so the demo does not depend on a faucet at presentation time.
- **UI copy in Spanish for the target audience,** isolated in copy files so another language can be added. Documentation and code are in English.
- **Amounts** are `bigint` base units in state and are parsed and formatted only in `lib/format`, always shown with the asset code.
- **Generated bindings, regenerated by script.** `npm run bindings -- <CONTRACT_ID>` rewrites `src/contracts/generated/index.ts` from a deployed contract. The generated client reports a contract error with the documentation text of the Rust variant and drops its numeric code, which is why errors are read from the simulation instead (decision 0008).
- **Wallet loaded on demand.** Stellar Wallets Kit touches the browser's `window`, so it is imported only when a wallet action runs. The adapter takes the kit through an injectable loader, which lets tests run without a browser.
- **No secrets in the browser.** The wallet signs. Throwaway demo keys, if used, are a separate decision and are not part of the app code.
- **Fee collection and off-ramp:** out of scope for the prototype. Anchors for Colombia (for example local payment rails) are to be validated against each anchor's current documentation.

## Quality gates

Per `toolkit/playbooks/verify.md`:

```
Contract:  cargo fmt --check → cargo clippy -- -D warnings → cargo test → stellar contract build
Frontend:  npm run lint → npm run typecheck → npm test → npm run build   (in frontend/)
Flow:      the real flow on testnet with fresh funded accounts, plus one failure path
```

`npm test` runs offline: wallet, network and contract are replaced by fakes. The optional checks in `src/live/` read a real treasury on testnet; see [06-getting-started.md](06-getting-started.md). Wallet signing with a real browser extension is not covered by any automated test yet.

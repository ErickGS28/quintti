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
| Contract | Rust + `soroban-sdk` | See [03-contract-design.md](03-contract-design.md) |
| Access control and utilities | OpenZeppelin Stellar Contracts, if it fits | Evaluate before writing our own. The role model here is small, so a hand-written check may be simpler. Decide and record it when scaffolding |
| CLI and deployment | Stellar CLI | Build, deploy and invoke on testnet |
| Frontend | TypeScript (strict) + Next.js (App Router) | Per `toolkit/playbooks/frontend.md` |
| Wallet | Stellar Wallets Kit, with Freighter as the main wallet | Multi-wallet connection and signing. Verify current API and supported wallets |
| Client SDK | `@stellar/stellar-sdk` and generated contract bindings | Simulate, sign, submit, read state |
| Invoice fingerprint | Web Crypto API (SHA-256) in the browser | No server involved |
| Token | Testnet USDC (SAC) or an own test token | One controlled token for the core flow. See limits below |
| Explorer | stellar.expert | Every flow links to its transactions |
| Hosting | Vercel or Netlify | Public URL for the demo |

Versions are pinned when the project is scaffolded and recorded in this table. Until then, confirm them at `developers.stellar.org`.

## Repository structure

Layering follows `toolkit/AGENTS.md` (feature-based plus atomic design). If they differ, that document prevails.

```
quintti/
├── README.md
├── docs/                          this documentation
│   └── decisions/                 design decisions
├── contracts/
│   └── treasury/src/              lib.rs · types.rs · errors.rs · events.rs · storage.rs · logic.rs · test.rs
├── frontend/src/
│   ├── app/                       routes, composition only
│   ├── features/
│   │   ├── public-view/           balance, budget lines, expense history, invoice check
│   │   ├── expenses/              propose and approve expenses
│   │   ├── governance/            budget, vendors, council, administrator
│   │   └── wallet-session/        connect, network check, signer selection
│   ├── components/                atoms · molecules · organisms · templates
│   ├── lib/
│   │   ├── stellar/               RPC client and transaction service
│   │   ├── wallet/                wallet adapter around Stellar Wallets Kit
│   │   ├── hash/                  invoice SHA-256
│   │   └── format/                amounts, dates, addresses
│   ├── contracts/generated/       bindings, never edited by hand
│   └── config/                    validated environment and constants
└── scripts/                       deployment and demo data
```

Layer rules (imports go downward only): `app → features → components → lib → contracts/generated`. A feature never imports another feature's internals. Only `lib/stellar` and `lib/wallet` talk to the SDK or wallet.

Visual design is pending. Colors, typography and spacing live in one tokens file from the first screen, so applying the brand later is a change in one place.

## Technical flow of a transaction

1. The frontend builds the contract call with the generated client.
2. It is **simulated** first, so contract errors surface before asking for a signature.
3. The wallet signs. A rejected signature is a normal outcome, not an error screen.
4. The transaction is submitted and its status polled with a retry limit.
5. Affected queries are refreshed and the UI shows the result with an explorer link.

Components never build, sign or submit transactions. They call feature services.

## Reading the public view

The public view calls the contract's read functions through simulation (no signature, no account). It rebuilds the history from contract **state** (`expense_count`, `get_expenses`), not from events, because RPC event retention is limited (*to verify*).

## Technical decisions

- **No backend.** There is nothing that needs a secret in the prototype. A server route is added only if an anchor or relayer key becomes necessary.
- **One controlled token.** Testnet assets are fragmented, so the core flow uses a single token. Anything simulated is stated openly.
- **Several signers in a demo.** The flow needs the administrator and at least two council members. Switching wallet accounts live is fragile, so the demo uses a documented approach: a real wallet for the main signer and throwaway testnet keys for the others, clearly labelled. The final choice is recorded as a decision here once the demo is built.
- **Prepared demo data.** Funded accounts, a seeded treasury, budget lines and vendors, so the demo does not depend on a faucet at presentation time.
- **UI copy in Spanish for the target audience,** isolated in copy files so another language can be added. Documentation and code are in English.
- **Amounts** are `bigint` base units in state and are parsed and formatted only in `lib/format`, always shown with the asset code.
- **Fee collection and off-ramp:** out of scope for the prototype. Anchors for Colombia (for example local payment rails) are to be validated against each anchor's current documentation.

## Quality gates

Per `toolkit/playbooks/verify.md`:

```
Contract:  cargo fmt --check → cargo clippy -- -D warnings → cargo test → stellar contract build
Frontend:  lint → typecheck → test → build
Flow:      the real flow on testnet with fresh funded accounts, plus one failure path
```

Command names and flags are confirmed against the installed tools before use.

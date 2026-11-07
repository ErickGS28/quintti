# Changelog

Notable changes to Quintti, newest first. The project has no versioned releases yet, so entries are grouped by date. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Current state

Updated: 7 November 2026.

| Area | State |
|------|-------|
| Product documentation | Written: idea, vision, product and flows, contract design, architecture, risks, getting started, 8 decisions |
| Treasury contract | Implemented and unit tested (78 tests). Development deployment on Stellar testnet |
| Web app: non-visual foundation | Built and tested (135 offline tests, 6 optional live tests against testnet): validated configuration, generated contract bindings, transaction layer, wallet adapter, input validation, Spanish error messages, treasury reader, expense and governance services, wallet session, query hooks |
| Web app: interface | Not built. There are no screens, only a placeholder page |
| Visual design | Pending (logo and palette). The interface will take its values from one tokens file |
| Real wallet signing | Not tried with a browser wallet extension. Covered only by fakes |
| Audit | None. Testnet only, not for real funds |

What works today, verified on testnet:

- Contract, through the command line and through the web foundation: setting a budget and approved vendors, a deposit, an expense proposal, council approvals that pay the vendor at the threshold, and rejections for a payment above the category limit and for an approval by a non-council member.
- Web foundation, against a real treasury: reading the configuration, balance, budget lines, vendors and the full expense history with its invoice fingerprint and approvals, and seeing an over-budget proposal rejected with the right rule name before any signature is requested.

Known limits are in [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md). How to run everything is in [docs/06-getting-started.md](docs/06-getting-started.md).

Development deployment (temporary, the testnet is reset periodically):
`CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA`.

## Unreleased

Nothing yet.

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

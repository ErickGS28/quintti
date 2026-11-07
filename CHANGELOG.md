# Changelog

Notable changes to Quintti, newest first. The project has no versioned releases yet, so entries are grouped by date. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Current state

Updated: 7 November 2026.

| Area | State |
|------|-------|
| Product documentation | Written: idea, vision, product and flows, contract design, architecture, risks, getting started, 7 decisions |
| Treasury contract | Implemented and unit tested (78 tests). Development deployment on Stellar testnet |
| Web app | Not built yet. The non-visual foundation is being added (see Unreleased) |
| Visual design | Pending (logo and palette). Interface values are centralized so the brand can be applied later |
| Audit | None. Testnet only, not for real funds |

What works today, verified on testnet: setting a budget and approved vendors, a deposit, an expense proposal, council approvals that pay the vendor at the threshold, and rejections for a payment above the category limit and for an approval by a non-council member.

Known limits are in [docs/05-risks-and-limits.md](docs/05-risks-and-limits.md). How to run everything is in [docs/06-getting-started.md](docs/06-getting-started.md).

Development deployment (temporary, the testnet is reset periodically):
`CAQ6YXC6L3G2YVBWW52IPDNVBRCDMUO3S463MQL5HD2KGNDCOT5NCHDA`.

## Unreleased

### Added
- Getting started guide and this changelog.

## 2026-11-07

### Added
- Treasury contract (`contracts/treasury`, `soroban-sdk` 29.0.1):
  - Constructor that fixes the token, the assembly, the administrator, the council and the threshold.
  - Budget lines per category and an approved vendor list, both managed by the assembly.
  - Expense proposals by the administrator with the invoice fingerprint, and a paginated expense history.
  - Council approvals. The approval that reaches the threshold rechecks the rules and pays the vendor, updating state before the transfer.
  - Expense cancellation by the administrator or the assembly.
  - Administrator replacement and council rotation by the assembly. Approvals from removed members stop counting.
  - Deposits that record who paid.
  - Self-dealing guard: the assembly, the administrator and council members cannot be paid as vendors.
- 78 unit tests covering the happy paths, every error variant, boundaries, authorization (by signer and without mocked authorization), fund conservation and the category limit.
- Product and architecture documentation with design decisions 0001 to 0007.
- Development deployment on Stellar testnet and a full expense cycle run from the command line.

### Changed
- The contract uses a constructor instead of an `initialize` function, so there is no window to initialize it twice.
- Design documents were aligned with the implementation.

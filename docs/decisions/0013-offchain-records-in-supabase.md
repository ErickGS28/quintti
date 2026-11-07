# 0013. Off-chain records in Supabase, verified against the contract

Status: Accepted. Amends [0007](0007-no-backend.md): a server now exists, for one reason.

## Context

The contract stores what the rules need: category, vendor address, amount and the invoice's SHA-256. It does not store what people need to read a payment: a description ("reparación del motor del ascensor"), the vendor's name, and the invoice file itself. Decision 0005 left open where the file lives so a resident can retrieve it. Without these, the public view shows an address and a hash.

Decision 0007 allowed a server route only if a secret became necessary. Storing files and rows that only trusted code may write needs one: a database key.

## Decision

Keep the money and the rules on-chain. Keep the words and the files in **Supabase**, written only by the app's server:

- **Tables** (`supabase/migrations/20261108000000_offchain_records.sql`, one migration with the whole schema): `buildings` (the building's name), `people` (names for known addresses, display only) and `expense_details` (description, vendor name and the invoice's location). Every row is keyed by the treasury contract, so one database can serve several buildings.
- **Files** in a private `invoices` bucket. The server streams them to anyone who asks.
- **Writes are verified.** `POST /api/details/{id}` accepts a file only if its SHA-256 equals the `invoice_hash` the contract stores for that expense, read from the contract by the server. Details are written once: a database trigger refuses updates and deletes.
- **No public access to the database.** Row level security is on with no policies; only the server, with the secret key (`SUPABASE_SECRET_KEY`, never `NEXT_PUBLIC_`), reads and writes. The browser talks to the app's API, never to Supabase.
- **No new dependency.** The server calls Supabase's REST and storage endpoints with `fetch` (`lib/supabase/rest.ts`).
- **Optional.** Without the two environment variables the API answers "not configured" and the app shows the contract's data only.

## Consequences

- A resident reads "Técnico de ascensores, reparación del motor" and downloads the invoice, then checks its fingerprint against the contract in the browser.
- Nobody can attach a different invoice to an expense, and nobody can replace one once saved. The description, however, is written by whoever first uploads the right file, which in practice is the administrator who proposed it. A signed message from the administrator's wallet would close that gap; it is a later step.
- Names in `people` are written by the team and are display only; they never authorize anything.
- The database is a convenience and a trust point for the words, never for the money: if it disappears, the treasury and its history are intact on-chain.
- Hosting platforms cap request bodies at about 4.5 MB, so the app uploads invoices up to 4 MB. Larger files still get their fingerprint on-chain.

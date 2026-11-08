# 0014. No off-chain records in the demo

Status: Accepted. Supersedes [0013](0013-offchain-records-in-supabase.md) and restores [0007](0007-no-backend.md).

## Context

Decision 0013 added a server with a Supabase database and a private file bucket, so each expense could have a description, a vendor name and a downloadable invoice. It was well built (the server accepted an invoice only if its SHA-256 equaled the fingerprint the contract recorded, and rows were written once), but reviewing it for the demo the team found that it did not earn its place:

- The scoring that matters most comes from the contract, the wallet and the transactions visible in stellar.expert. The descriptions and files add readability, not a rule.
- It had never run against a real Supabase project, and it needed a project, two secrets, a migration and a host with a server just to show the demo.
- It put a database and a secret key next to a pitch whose point is that nobody controls the rules.
- Everything it added degraded gracefully: without it the app already works from the contract alone, and the invoice check already runs in the browser.

## Decision

Remove the server, the database and the file storage from the app. The browser talks only to the Soroban RPC and the wallet. The invoice stays off-chain with the administration; its fingerprint is on-chain, and anyone who is given the file can check it on the Verify screen or on an expense's page.

Addresses show the role the contract itself gives them (the assembly, the administration) or their shortened form; an expense is shown by its category, vendor address and amount.

The work stays in the history: the branch `feat/treasury-app` and the commits before this decision keep the schema, the routes and their tests, in case a later version wants them.

## Consequences

- No secret, no database and no server code of our own. The app can be hosted anywhere that runs Next.js, and the manual and the contract are the whole story.
- A resident cannot download an invoice from Quintti. They compare a file they were given against the on-chain fingerprint.
- A payment has no free-text description. A later version could add one, ideally signed by the administration's wallet so that it cannot be written by anyone else.
- The demo data should use Spanish category names, since they are shown as stored.

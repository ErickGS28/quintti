# 0005. Invoice fingerprint on-chain, file off-chain

Status: Accepted

## Context

Every expense should be tied to its invoice. Storing files on-chain is expensive and exposes private documents. Running a backend to store them adds infrastructure and a trust point.

## Decision

The browser computes the SHA-256 hash of the invoice file and the contract stores only the 32-byte hash with the expense. A resident can drop the same file on the public page, and the page shows whether its hash matches.

## Consequences

- No backend and no document ever goes on-chain.
- The hash proves the file was not changed after the proposal. It does not prove the expense is real.
- Where the file itself lives so a resident can retrieve it is an open question (the administrator shares it, or a decentralized store is added later).

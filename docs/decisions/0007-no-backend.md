# 0007. No backend in the prototype

Status: Accepted, amended by [0013](0013-offchain-records-in-supabase.md)

## Context

The prototype needs wallet signing, contract reads and writes, and hashing a file. None of these needs a secret held by a server.

## Decision

Everything runs in the browser against the Soroban RPC and the contract. State is read from the contract, not from an indexer. A server route is added only if a secret becomes necessary, for example an anchor API key.

## Consequences

- Less infrastructure, a simpler deployment and fewer trust points.
- No history beyond what the contract stores. The history is rebuilt from contract state, because RPC event retention is limited (to verify).
- No notifications to residents until a server or a third-party service exists.

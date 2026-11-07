# 0008. Read simulation errors directly

Status: Accepted

## Context

The generated TypeScript client simulates every call when it builds it. When the contract rejects a call, the client's `result` becomes an error object whose message is the **documentation comment** of the Rust error variant (for example "No expense exists with that id."), and the numeric code is lost. Checking against the real testnet showed this. The same client would also go on to ask the wallet for a signature on a call already known to fail.

The interface needs two things: to know *which* rule rejected the call, so it can show the right message, and to never ask for a signature on a call that will fail.

## Decision

`lib/stellar/transaction-service.ts` inspects the simulation of every call before reading `result` or signing. If the simulation reports an error, it throws that error's original text, which contains `Error(Contract, #n)`. `toAppError` reads the code and maps it to the error's name. The list of names lives in `lib/stellar/contract-errors.ts` and a test checks it against the generated bindings.

A contract `Err` that only appears in a final result is mapped through the name carried by the generated bindings.

## Consequences

- The interface shows the right message for each of the 19 contract errors.
- The wallet is not opened for a call that is already rejected.
- The mapping depends on the text `Error(Contract, #n)` produced by the network. If that format changes, the live checks in `src/live/` and the unit tests fail instead of the interface silently showing a generic message.
- Regenerating the bindings after a contract change is a script, and the cross-check test shows if a contract error was added or renumbered.

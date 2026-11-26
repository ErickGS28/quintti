# 0018. Mainnet as an opt-in beta with symbolic funds

Status: Proposed. The code supports mainnet and nothing is deployed there. Deploying is a separate, deliberate step, described in [10-mainnet-launch.md](../10-mainnet-launch.md).

## Context

Until now the web app refused to run on mainnet: `constants.ts` said "Mainnet is deliberately absent" and the configuration rejected it. That was a safety choice, and it matched the documents: the contract is unaudited and "must not hold real value" ([05-risks-and-limits.md](../05-risks-and-limits.md)).

Ship It (BAF x Stellar, 23 to 27 November 2026) has a bonus for a contract or app on mainnet with a real transaction made from the product. Together with the six daily missions it gives a direct Golden Ticket. The bonus asks for a launch, not for custody of anyone's money.

Nothing about the contract changes. What changes is whether the web app may be pointed at mainnet, and what it tells people when it is.

## Decision

Support mainnet in the web app as an opt-in, with guards, and describe it everywhere as an unaudited beta to be used with symbolic amounts.

- **Opt-in.** The default network stays testnet. Mainnet needs `NEXT_PUBLIC_STELLAR_NETWORK=mainnet`.
- **No default RPC.** The SDF runs no public Soroban RPC on mainnet, so the app does not guess one. `NEXT_PUBLIC_SOROBAN_RPC_URL` is required and must be https, which makes choosing a provider a conscious step.
- **The interface says what it is.** On mainnet the sidebar reads "Red principal · beta sin auditar", the landing footer and the manual say it is an unaudited beta, ask for symbolic amounts and no longer claim "no real money". These texts live in separate exports and a test checks they never mention testnet.
- **A separate site.** The network is fixed when the site is built, so mainnet is a second build with its own variables and its own address. The testnet demo keeps running.
- **The deployment script defaults to a dry run.** `scripts/deploy-treasury.ps1` shows the plan and sends nothing unless it gets `-Execute`, and on mainnet it asks for the word MAINNET.

## Consequences

- The default build, the tests and the testnet demo are unchanged. 246 tests pass, 6 of them new.
- Mainnet funds are only as safe as the contract. The contract is not audited and cannot be upgraded: a bug means a new deployment and a migration of whatever it held. Real money must stay symbolic until an audit.
- Quintti must not hold money that belongs to residents or to anyone outside the team on mainnet. That would be custody by an unaudited contract.
- The multi-signature assembly of [0017](0017-a-collective-assembly.md) cannot sign from the app. On mainnet, rule changes by a multi-signature assembly go through the command line, and the app can propose, approve and read.
- The hidden `/negocio` page still says "red de pruebas" in three places (the plan and the status line). They describe the plan, not the network the page runs on, and were left as they are. The sidebar, the landing footer and the manual are the places that state the network.
- Because the guard "mainnet is not supported" is gone from `env.ts`, someone can now point a build at mainnet by mistake. The sidebar label and the required RPC are the safeguards. A stricter option, if this worries the team, is to require a `NEXT_PUBLIC_MAINNET_ACKNOWLEDGED=yes` variable.

## Alternatives considered

- **Keep mainnet unsupported and use only scripts.** Simpler and safer, but the bonus asks for a transaction made from the product, and the app is the product.
- **Deploy to mainnet and not say it is a beta.** Rejected: it would contradict the risk document.

# 11. Ship It: the mainnet plan

> **This plan is only for the Ship It challenge** (BAF x Stellar, 23 to 27 November 2026). It is optional, it is not part of the product roadmap, and the normal development of Quintti follows a different line: [09-state-and-next-steps.md](09-state-and-next-steps.md). If the plan is not carried out, nothing else depends on it.

Status on 25 November 2026: **prepared, not decided, not run.** Nothing is deployed on mainnet. The person who owns the keys decides, around 27 November, whether there is time to do it.

## What it is for

The Ship It challenge has a bonus called "Lancé en mainnet": a contract or an app on mainnet with a real transaction made from the product. A team that also completes all six missions (00 to 05) gets a direct Golden Ticket to the Ship It Brunch in Mexico City. The bonus is not required to finish the challenge.

It asks for a launch. It does not ask for, and this plan does not involve, money that belongs to anyone else.

## What is already built

Added on the `shipit` branch and merged into `dev` and `main`, ready to use or to leave unused:

| Piece | Where |
|-------|-------|
| The web app can be built for mainnet as an opt-in, labelled an unaudited beta | [decisions/0018](decisions/0018-mainnet-as-an-opt-in-beta.md), `frontend/src/config/` |
| A deployment script that only shows the plan unless it gets `-Execute`, and asks for the word MAINNET | `scripts/deploy-treasury.ps1` |
| The detailed guide to launch | [10-mainnet-launch.md](10-mainnet-launch.md) |

The testnet demo, the tests and the default build are unchanged. 246 frontend tests and 95 contract tests pass.

## The plan, step by step

Each step says who does it. Time to allow: a few hours, plus the wait for the exchange to send the XLM.

| # | Who | Step |
|---|-----|------|
| 1 | Owner | In Freighter, switch to **Mainnet** and have three accounts: **A** (assembly, the one that signs from the app), **B** (administrator) and **C** (council). Copy each public address (`G...`) |
| 2 | Owner | Buy XLM at an exchange (about 10 to 15 XLM, only a rough figure; the script reports the exact cost before sending). Send about 5 to account A and about 5 to the deployer of step 3. B and C can stay empty for this test |
| 3 | Owner | Create the deployer key on the machine: `stellar keys generate qm-deployer`, then `stellar keys address qm-deployer`, and send it the XLM |
| 4 | Owner, then assistant | The owner shares the three public addresses and confirms the deployer is funded |
| 5 | Assistant | Runs `deploy-treasury.ps1` **without** `-Execute`: roles, token address, WASM hash and the real upload fee. Nothing is sent |
| 6 | Owner | Runs the same command with `-Execute` and types `MAINNET`. Keeps the contract address (`C...`) and the transaction link |
| 7 | Owner, then assistant | The owner shares the contract address. The assistant builds the mainnet site into a folder outside the repository |
| 8 | Owner | Creates a **new** Netlify site (the testnet one stays untouched) and drops that folder on it |
| 9 | Owner | Opens the new site (the sidebar must read "Red principal · beta sin auditar"), connects account A on Mainnet, goes to Reglas, sets a symbolic budget line (for example `mantenimiento`, 1 XLM) and signs. Copies the `stellar.expert/explorer/public/tx/...` link |
| 10 | Owner | Pastes that link in the "Lancé en mainnet" form of the challenge |
| 11 | Assistant, if asked | Merges `shipit` into `dev` and `main` with fast-forward only, and adds the mainnet address and transaction to the README, separate from the testnet table, with the unaudited warning |

The RPC to use is `https://soroban-rpc.mainnet.stellar.gateway.fm`. On 25 November it answered a health check and allowed requests from a web origin (CORS). Three other public RPCs did the same: `https://mainnet.sorobanrpc.com`, `https://stellar.api.onfinality.io/public` and `https://rpc.lightsail.network/`.

## What must never be shared

A seed phrase, a secret key (it starts with `S`) or a wallet password. The assistant only needs public addresses (`G...`, `C...`) and links. The final deployment is typed by the owner, not by the assistant.

## Limits and risks

- **Unaudited and not upgradeable.** A bug means a new deployment. Use symbolic amounts only.
- **No money from third parties.** Quintti must not hold residents' fees on mainnet.
- **A second site.** The network is fixed when the site is built. Do not point the testnet site at mainnet.
- **Time.** Buying XLM and moving it can take longer than expected. If the decision is made on the last day, start steps 1 to 3 first, because they depend on others. Check the closing time of the challenge in the mission itself; it follows Mexico City time.
- **The mission asks for a transaction "made from the product".** Setting a budget line from the app qualifies on the reading of the mission text. The reviewers decide.
- **Figures to verify:** the amounts of XLM above and the minimum balance of a mainnet account are not confirmed.

## If it is not done

- Nothing is lost. The code is opt-in and harmless on testnet.
- The work is already merged into `dev` and `main`, so there is nothing to undo. After the challenge closes, delete the `shipit` branch.
- The challenge's missions 00 to 05 are independent of this plan.

## Where normal development goes

The Instaward sprint and the product keep their own line, in [09-state-and-next-steps.md](09-state-and-next-steps.md): the multi-signature assembly inside the app, a pilot in shadow mode, a way for fees to arrive, then an audit. A mainnet deployment with real value belongs to that line only after the audit.

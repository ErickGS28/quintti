# 10. Launching on mainnet

A step-by-step guide to put a Quintti treasury on Stellar mainnet as an unaudited beta, with symbolic funds. Read [decision 0018](decisions/0018-mainnet-as-an-opt-in-beta.md) first. Nothing here has been run on mainnet yet: every step marked *to verify* needs checking when it is done.

## What counts for Ship It

The bonus asks for "a contract or app on mainnet with a real transaction made from your product". The smallest honest version:

1. A treasury contract deployed on mainnet.
2. One transaction that calls it, signed from the web app on a mainnet build. Setting a budget line from the Reglas screen is enough: it costs a network fee and moves no funds.
3. The explorer link of that transaction, in the form `https://stellar.expert/explorer/public/tx/...`.

## Before you start

| Need | Detail |
|------|--------|
| Real XLM | A few XLM from your own pocket. Each account that signs must exist on mainnet, which needs the network's minimum balance (*to verify* the current figure). Uploading the WASM cost 1.7 XLM in fees on testnet on 26 November 2026 (a simulation; the first estimate of 0.007 XLM was wrong, because that WASM was already installed). Mainnet fees may differ: `deploy-treasury.ps1` prints the upload fee from a simulation once the paying account is funded, and the deployment is a second transaction |
| Keys | New ones. Do not reuse the `qt-*` testnet identities. Use a wallet (Freighter or a hardware wallet) for the roles that sign from the app, and a CLI identity only for the deployer |
| An RPC provider | The SDF runs no public Soroban RPC on mainnet. The [Stellar documentation](https://developers.stellar.org/docs/data/apis/rpc/providers) lists providers and public URLs, for example Gateway at `https://soroban-rpc.mainnet.stellar.gateway.fm`. Public ones are rate limited, and a key in a browser bundle is public |
| A second Netlify site | The network is fixed when the site is built. The testnet site stays as it is |

## Choose the roles

A single person holding every role is a demo, and the page says so. For a launch that is honest and works from the app:

| Role | Suggested | Why |
|------|-----------|-----|
| Assembly | One wallet account | The app signs with one wallet, so the Reglas forms work. A multi-signature assembly can only be used from the command line ([0017](decisions/0017-a-collective-assembly.md)) |
| Administrator | A second account | It cannot be on the council |
| Council | One to three accounts, threshold 1 to the council size | A threshold of 1 with a single member is the minimum the contract accepts |

Every address must be a funded mainnet account if it is to sign.

## Steps

1. **Rehearse on testnet.** It costs nothing and uses the same script:

   ```
   stellar contract build
   ./scripts/deploy-treasury.ps1 -Network testnet -Source qt-admin -Name "Torres del Parque" -Assembly G... -Administrator G... -Council G...,G... -Threshold 2 -RotationDelay 60 -Execute
   ```

2. **Create the deployer and fund it with a little XLM.**

   ```
   stellar keys generate qm-deployer
   stellar keys address qm-deployer
   ```

   Send XLM to that address from an exchange or a wallet.

3. **See the plan on mainnet. Nothing is sent without -Execute.**

   ```
   ./scripts/deploy-treasury.ps1 -RpcUrl https://soroban-rpc.mainnet.stellar.gateway.fm -Source qm-deployer -Name "Torres del Parque" -Assembly G... -Administrator G... -Council G... -Threshold 1
   ```

   Check the roles, the token address and the fee.

4. **Deploy.** Add `-Execute`, type `MAINNET` when asked. Keep the contract address and the transaction link it prints.

5. **Build the mainnet site.** In a copy of `frontend/.env.local`, or as variables in the second Netlify site:

   ```
   NEXT_PUBLIC_STELLAR_NETWORK=mainnet
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-rpc.mainnet.stellar.gateway.fm
   NEXT_PUBLIC_TREASURY_CONTRACT_ID=C...
   NEXT_PUBLIC_TOKEN_SYMBOL=XLM
   ```

   Then `npm run build`. The sidebar must read "Red principal · beta sin auditar". If it says "Red de pruebas", the variables did not reach the build.

6. **Make the transaction from the app.** Open the site, connect the assembly wallet on mainnet, go to Reglas and set a budget line. Open the transaction in the explorer and check it is on the public network.

7. **Record it.** Put the contract address and the transaction in the README as a mainnet beta, separate from the testnet table, and keep the "unaudited" warning next to them.

## What not to do

- Do not deposit money that belongs to someone else. The contract is not audited and cannot be upgraded.
- Do not describe the mainnet deployment as production or as safe. It is a beta to prove that the product runs on the real network.
- Do not point the existing testnet site at mainnet. Use a second site.
- Do not put a secret key in an environment variable or a file in the repository. Only `NEXT_PUBLIC_*` values reach the browser, and an RPC key is public once it is there.

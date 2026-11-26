# 12. Buildings and links

How a building is created, shared and opened, with no server. The reasons are in [decision 0019](decisions/0019-buildings-by-link-without-a-backend.md); this document is how to do it.

## The pieces

| Piece | What it is | Where it lives |
|-------|------------|----------------|
| The building | One treasury contract. Its name, roles, budget, vendors and expenses are all on it | Stellar |
| Its address | A contract address that starts with `C` and has 56 characters | Everywhere |
| The link | `https://<your site>/app/?edificio=C...` | Anyone can open it |
| The list | The addresses a person saved, in `localStorage` under `quintti.buildings` | That person's browser |
| The configured building | The one the site is built with, `NEXT_PUBLIC_TREASURY_CONTRACT_ID` | The site's build |

## Creating a building

For now a building is created from the command line. A screen to do it from the browser is on the roadmap.

```
stellar contract build
./scripts/deploy-treasury.ps1 -Network testnet -Source <identity> -Name "Torres del Parque" `
  -Assembly G... -Administrator G... -Council G...,G...,G... -Threshold 2 -Execute
```

Without `-Execute` the script only shows the plan. The name is shown to every resident, so the assembly sets it (up to 80 bytes) and can fix it later with `set_name`. The script prints the contract address and the transaction.

Deploying another building with the same WASM should cost far less than the first, because the WASM is already installed on the network. The script's simulation of the upload estimated 0.008 XLM for a second building on testnet, against 1.7 XLM the first time with a new WASM. These are estimates from a simulation, not fees charged, and mainnet may differ.

## Sharing a building

1. Open the building in the app and choose **Copiar enlace** in the building card (the left column, or the menu on a phone).
2. Send the link by any channel: WhatsApp, email, a printed QR.
3. Whoever opens it sees the building and can read everything, with no account and no wallet.

The link is the same for everyone. To read the building a person needs nothing else.

## Opening a building you were sent

1. Open the link. The building shows, with a notice: *Abriste este edificio desde un enlace*.
2. **Read the address in the notice and confirm it with the administration**, by a channel other than the link itself (a phone call, the minutes of the assembly). A link can point at a contract that only looks like a building.
3. If it is the right one, choose **Es la correcta, guardar**. The notice goes away and the building is in your list.

Until you save it, the building is read-only: the buttons that sign do not appear, even if your wallet holds a role in that contract.

## Your list of buildings

**Mis edificios** (under the building's name in the left column) lists the main building and the ones you saved. For each one:

- the name, read from the chain;
- a button to copy its link;
- a button to remove it from the list (the main building cannot be removed);
- **Abrir**, to switch to it.

To add one, paste a link or a contract address in the form. The app reads the building's name from the contract first, and refuses an address that is not a compatible Quintti treasury.

The list stays in this browser. Another device, a private window or cleared site data starts without it, and nobody else can see it.

## For whoever deploys the site

The site needs one building to land on: set `NEXT_PUBLIC_TREASURY_CONTRACT_ID` as before. Everything else comes from the link. A site built for the demo treasury can show any other building by link, on the same network, with no rebuild.

The network (`NEXT_PUBLIC_STELLAR_NETWORK`) and the RPC are fixed when the site is built, so every building a site shows is on that network. A link to a mainnet building opened on the testnet site says "No encontramos un edificio de Quintti con esa dirección en esta red".

## What can go wrong

| What you see | Why | What to do |
|--------------|-----|------------|
| "Ese enlace no abre ningún edificio" | The `edificio` value is not a contract address: the link was cut or edited | Ask for the link again |
| The building shows, but there is no button to sign | It was opened from a link and not saved, or your wallet holds no role in it | Save it after confirming the address. Check the account your wallet has selected |
| "No encontramos un edificio de Quintti con esa dirección en esta red" | The address is not a Quintti treasury, it is from an older version without a name, or it is on another network | Check the address and the network of the site |
| "No se pudo leer" next to a saved building | The contract could not be read right now or stopped being a treasury | Try again later, or remove it |
| The list is empty on another computer | The list lives in the browser | Add the buildings again, from their links |

## Limits

- No shared directory. A management company with many buildings must keep the links itself.
- No notification when a building needs a signature. The link is the only channel.
- No proof that a building is who it says it is. The name is whatever the assembly wrote. Confirm the address, not the name.

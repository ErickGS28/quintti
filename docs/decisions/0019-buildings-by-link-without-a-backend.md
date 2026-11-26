# 0019. Several buildings in one app, chosen by the link, with no backend

Status: Accepted. Amends [0016](0016-a-smaller-app.md): the app has three screens in its menu and one more, reached from the building card.

## Context

For a pilot the app has to serve more than one building. Until now the site was built with one contract address (`NEXT_PUBLIC_TREASURY_CONTRACT_ID`) and showed only that one.

There is no server to run a backend ([0007](0007-no-backend.md), [0014](0014-no-offchain-records-in-the-demo.md)), and the app is exported as static files, so a route per building (`/b/<contract>`) cannot exist: Next.js can only prerender routes it knows when it builds. A residents' directory shared by everyone would need a database.

Two facts make a backend unnecessary for a pilot. A building is fully identified by its contract address. And since the name, the description and the invoice link live on the contract, everything the app shows about a building can be read from it by anyone.

## Decision

The building is chosen by the link, and the list of buildings a person keeps lives in their own browser.

- **The link carries the building.** `/app/?edificio=C...` opens that building, for anyone, with no account. Every link inside the app keeps the parameter, so a refresh, a bookmark or a copied address bar all open the same building. For the building the site was built with the parameter is left out.
- **The configured building stays the default.** With no parameter the app shows the contract in `NEXT_PUBLIC_TREASURY_CONTRACT_ID`, exactly as before. The manual at `/hiw` always shows it.
- **A list in the browser.** `localStorage` under `quintti.buildings` holds the contract addresses the person saved, up to 20. Nothing about it leaves the browser.
- **One extra screen, `/app/edificios`** ("Mis edificios"): the buildings of the list, each with its name read from the chain, a button to copy its link, one to remove it, and a form that takes a link or an address. It is reached from the building card in the sidebar, so the menu keeps its three items.
- **The state is a React context in `lib/`.** `useBuilding()` says which contract is on screen, whether it is trusted, and gives `href(path)` to build links that keep the building. It lives in `lib/` because a feature never imports another feature, and the reading and writing features both need it.
- **Server and cache.** Every query is keyed by contract address, readers are created once per address, and the provider sits inside a `Suspense` boundary, as Next.js requires for `useSearchParams` in a static export.

### A building reached through a link is read-only until it is saved

A link can say anything. It can point at a contract that only looks like a building, with a name and a council chosen by whoever made it, and that contract decides what its own `approve_expense` does. If the app let someone sign there, a person who trusts a link could be asked to authorize something else.

So a building is **trusted** only if it is the configured one or the person saved it. Otherwise:

- The app shows a notice with the contract's full address and asks the person to confirm it with the administration before saving.
- Roles are not computed, so the person is a neighbour: no button that signs appears.
- The write hooks refuse as well (`AppError` of kind `untrusted-building`), so a bug in a screen cannot reach the wallet.

Saving is a deliberate click on the address the person has read. This does not make a building honest; it makes the person look at the address once and decide, and it keeps signing out of reach of a link that was just opened.

### Other rules

- **A link with a broken `edificio` value** shows its own page ("Ese enlace no abre ningún edificio"). It never falls back to the main building, because a person who followed a damaged link would believe they were looking at theirs.
- **An address is checked before it is saved.** The form reads the building's name from the contract. A valid contract address that is not a compatible Quintti treasury (for example an older version without `get_name`) is refused.
- **Only `http` and `https` are accepted** wherever text from a link or from the chain becomes an address someone can open.

## Consequences

- Sharing a building is copying a link. A resident needs no account and no wallet to read it.
- **The list is per browser.** Another device or a cleared browser starts empty, and nobody can see another person's list. This is stated on the screen. A directory shared by a management company is a backend feature and stays out until a pilot asks for it.
- **The link is the credential for reading, not for acting.** Anyone with the address can read the building, which is the point of the product: the record is public. Acting still needs the wallet of a role the contract recognizes, and a saved building.
- **The configured building is required.** `NEXT_PUBLIC_TREASURY_CONTRACT_ID` must still be set, because the site needs somewhere to land. A site with no default building would need a landing screen for it.
- **The saved list is not verified against the chain on its own.** An address that stops being a treasury shows "No se pudo leer" in the list. It can be removed.
- **There is no "last building I used".** Opening `/app/` with no parameter always shows the configured building. Links inside the app keep the parameter, so this only matters when the address is typed by hand.
- **Stale links in the menu.** The menu items carry the parameter in `href` and use `match` to decide which one is active, because the path alone does not contain it.

## Alternatives considered

- **A route per building (`/b/<contract>`).** Rejected: not possible in a static export for addresses unknown at build time.
- **A shared directory in a database.** Right for a management company with many buildings, wrong now: it needs a server nobody has. The contract already holds the name, so a directory is only an index, and it can come later without changing this.
- **Remember the last building in `localStorage` and open it by default.** Rejected: it makes the same address show different buildings on different browsers, which is confusing for someone who is sent a link and for anyone helping them over the phone.
- **Let anyone sign on any building.** Rejected for the reason above.

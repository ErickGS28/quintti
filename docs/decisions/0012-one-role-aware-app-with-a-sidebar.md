# 0012. One role-aware app with a sidebar

Status: Accepted

## Context

The product describes four screens (public view, council panel, assembly panel, setup) for five audiences ([02-product-and-flows.md](../02-product-and-flows.md)). Building them as separate panels would repeat the same data (balance, budget, expenses, council) in several places, and a person who holds two roles would jump between panels. The app also needs persistent context on every screen: which building, which network, which wallet is connected and with which role.

## Decision

Build **one app** under `/app` that everyone sees the same way, and let the connected wallet decide which actions appear:

- Anyone, without a wallet, reads everything: the overview, every expense with its approvals and fingerprint, the budget, the vendors, the council, and the invoice check.
- The administrator sees "Proponer gasto"; council members see "Aprobar" on pending expenses; the assembly sees the forms that change the budget, the vendors, the administrator and the council. The contract checks every call again, so the interface only hides what would be rejected.
- Navigation is a **sidebar** on large screens: six destinations (Resumen, Gastos, Presupuesto, Proveedores, Consejo y roles, Verificar factura), the building and the network at the top, the wallet at the bottom. On phones and tablets it becomes a top bar with a drawer. A top bar alone would crowd six links, the network and the wallet.

The roles are computed from the contract's configuration (`lib/treasury/roles.ts`). The session that joins the wallet and the contract state lives in the app layer (`app/app/_shell/session.tsx`), because it combines several features.

## Consequences

- One place per piece of information, and the same link works for a resident and for a council member.
- A person with two roles sees both sets of actions without switching panels.
- Hiding an action is a convenience, not security: the contract is the only authority.
- The routes are in Spanish (`/app/gastos`, `/app/presupuesto`), like the interface; the code stays in English.

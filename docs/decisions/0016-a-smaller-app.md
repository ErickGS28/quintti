# 0016. A smaller app: three screens and fewer words

Status: Accepted. Amends [0012](0012-one-role-aware-app-with-a-sidebar.md): still one role-aware app, with fewer screens.

## Context

Decision 0012 gave the app six destinations: Resumen, Gastos, Presupuesto, Proveedores, Consejo y roles and Verificar factura, with a paragraph under almost every title. Reviewing it for the demo video, the team found it was more than the story needs. The product fits in four verbs (the assembly sets the rules, the administration proposes, the council approves, the contract pays), and three of the six screens only served the assembly, which the demo touches briefly. A viewer would get lost in the menu and in the text.

## Decision

Keep the app minimal and put the effort into the one flow that matters:

- **Three screens.** Resumen (balance, budget used, pending, signatures, latest expenses, your role, who decides), Gastos (the list, the detail of each expense, and proposing one) and Reglas (budget, approved vendors and who decides, in one place; the assembly sees the forms to change the budget and the vendors).
- **The invoice check lives in each expense.** Dropping the original file in an expense's detail shows whether its fingerprint matches the one on-chain. The standalone "Verificar factura" screen and its card on the overview were removed. The check now compares one fingerprint, so the multi-expense matching code was removed too.
- **No forms for replacing the administrator or the council.** The contract still supports both, and the services and hooks stay, but the app does not offer them: the demo does not need them and each one is a form to explain, test and keep correct. The manual says so.
- **Fewer words.** Page descriptions, hints and explanations that repeat what the screen already shows were cut from the app, the landing page and the manual. A title and, where the screen needs one, a single short line.

## Consequences

- The sidebar has three items and the demo flow has fewer places to get lost. The old addresses `/app/presupuesto`, `/app/proveedores`, `/app/consejo` and `/app/verificar` no longer exist.
- Assembly features that remain in the app: set a category's limit, approve or remove a vendor, and cancel a pending expense.
- If a real assembly needs to rotate the council or replace the administrator, the form comes back as part of Reglas; the contract and hooks are ready.

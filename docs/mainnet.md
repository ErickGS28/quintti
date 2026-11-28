
# Quintti on mainnet: five functions used from the frontend

An unaudited beta with symbolic amounts. Nothing here holds money that belongs to anyone else.

## The contract

| | |
|---|---|
| Network | Stellar mainnet (public) |
| Treasury contract | [{{CONTRACT}}](https://stellar.expert/explorer/public/contract/{{CONTRACT}}) |
| Deployment transaction | [{{DEPLOY_TX}}](https://stellar.expert/explorer/public/tx/{{DEPLOY_TX}}) |
| Token | Native XLM through its Stellar Asset Contract, `CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA` |

The frontend is the app in `frontend/`, built with `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` and `NEXT_PUBLIC_TREASURY_CONTRACT_ID` set to the contract above. Every transaction below was signed in a browser wallet (Freighter) on mainnet from that build. Paths are relative to `frontend/src/`; the contract is `contracts/treasury/src/lib.rs`.

## The five functions

Each call goes through the same path: a screen in `app/app/_screens/` renders a component, the component calls a mutation hook, the hook calls a service, and the service calls the generated client with `executeWrite` (simulate, ask the wallet to sign, send).

### 1. `set_budget`

- **What it does:** the assembly sets the spending limit of a category. A payment above the limit is rejected by the contract. Contract: `lib.rs:137`.
- **Where it is used:** screen Reglas (`/app/reglas`), component `BudgetLineForm`. The screen mounts it at `app/app/_screens/RulesScreen.tsx:90`.
- **How it is called:** the form submits at `features/governance/components/BudgetLineForm.tsx:49` (`setBudget.mutate`), which goes through `features/governance/hooks/use-governance-actions.ts:38` and reaches `client.set_budget` at `features/governance/services/governance-service.ts:21`.
- **Transaction:** [{{TX_SET_BUDGET}}](https://stellar.expert/explorer/public/tx/{{TX_SET_BUDGET}})

### 2. `set_vendor`

- **What it does:** the assembly approves a vendor address. Money can only be paid to approved vendors, and never to the assembly, the administrator or a council member. Contract: `lib.rs:163`.
- **Where it is used:** screen Reglas (`/app/reglas`), component `VendorForm`, mounted at `app/app/_screens/RulesScreen.tsx:121`.
- **How it is called:** the form submits at `features/governance/components/VendorForm.tsx:29` (`setVendor.mutate`), through `features/governance/hooks/use-governance-actions.ts:42`, and reaches `client.set_vendor` at `features/governance/services/governance-service.ts:28`.
- **Transaction:** [{{TX_SET_VENDOR}}](https://stellar.expert/explorer/public/tx/{{TX_SET_VENDOR}})

### 3. `deposit`

- **What it does:** any account moves tokens into the treasury, and the contract records who paid. Contract: `lib.rs:351`.
- **Where it is used:** screen Depositar fondos (`/app/depositar`), component `DepositForm`, mounted at `app/app/_screens/DepositScreen.tsx:62`.
- **How it is called:** the form submits at `features/funding/components/DepositForm.tsx:67` (`deposit.mutateAsync`), through `features/funding/hooks/use-deposit-action.ts:35`, and reaches `client.deposit` at `features/funding/services/deposit-service.ts:19`.
- **Transaction:** [{{TX_DEPOSIT}}](https://stellar.expert/explorer/public/tx/{{TX_DEPOSIT}})

### 4. `propose_expense`

- **What it does:** the administrator proposes a payment to an approved vendor, with a category, an amount, a description and the SHA-256 fingerprint of the invoice. The contract checks the vendor, the category and the budget before it accepts the proposal. Contract: `lib.rs:193`.
- **Where it is used:** screen Nuevo gasto (`/app/gastos/nuevo`), component `ProposeExpenseForm`, mounted at `app/app/_screens/ProposeScreen.tsx:57`.
- **How it is called:** the form submits at `features/expenses/components/ProposeExpenseForm.tsx:112` (`propose.mutateAsync`), through `features/expenses/hooks/use-expense-actions.ts:39`, and reaches `client.propose_expense` at `features/expenses/services/expense-service.ts:53`.
- **Transaction:** [{{TX_PROPOSE}}](https://stellar.expert/explorer/public/tx/{{TX_PROPOSE}})

### 5. `approve_expense`

- **What it does:** a council member approves a pending expense. The approval that reaches the threshold pays the vendor in the same transaction. Contract: `lib.rs:261`.
- **Where it is used:** screen Detalle del gasto (`/app/gastos/<id>`), component `ApproveExpenseButton`, mounted at `app/app/_screens/ExpenseScreen.tsx:167`.
- **How it is called:** the button calls `approve.mutate` at `features/expenses/components/ApproveExpenseButton.tsx:35`, through `features/expenses/hooks/use-expense-actions.ts:43`, and reaches `client.approve_expense` at `features/expenses/services/expense-service.ts:64`.
- **Transaction:** [{{TX_APPROVE}}](https://stellar.expert/explorer/public/tx/{{TX_APPROVE}})

## Roles used in this run

| Role | Account | Why |
|------|---------|-----|
| Assembly and council (threshold 1) | `{{ACCOUNT_A}}` | Sets the rules from the Reglas screen and approves the expense |
| Administrator | `{{ACCOUNT_B}}` | Proposes the expense. The contract does not allow the administrator on the council |
| Vendor | `{{VENDOR}}` | An approved vendor that is none of the three roles above |

One account holds two roles. That is enough to exercise the five functions and says nothing about collective control; see [decision 0017](decisions/0017-a-collective-assembly.md) for the multi-signature assembly.

## Limits

Unaudited. The contract cannot be upgraded. The amounts are symbolic. Do not deposit money that belongs to anyone else. See [13-status-and-scope.md](13-status-and-scope.md).

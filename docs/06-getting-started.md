# 6. Getting started

How to build, test and try the treasury contract after cloning the repository. Everything here runs on the Stellar **testnet** with test funds. Nothing in this repository is audited, and none of it should hold real value.

Commands work in bash, zsh and PowerShell unless a note says otherwise.

## 1. Requirements

| Tool | Why | Check |
|------|-----|-------|
| Git | Clone the repository | `git --version` |
| Rust, through [rustup](https://rustup.rs) | Build and test the contract | `rustc --version` |
| [Stellar CLI](https://developers.stellar.org/docs/tools/cli) | Build the WASM, deploy and call the contract | `stellar --version` |
| A C/C++ linker | Needed by Rust to run the tests. On Windows, install the Visual Studio Build Tools with the C++ workload | |

Versions used while developing (7 November 2026): Rust 1.99.1, Stellar CLI 30.0.1, `soroban-sdk` 29.0.1. The repository pins the Rust toolchain through `rust-toolchain.toml`, so `rustup` installs the `wasm32v1-none` target and the components when you first build.

## 2. Clone, test and build

```
git clone https://github.com/ErickGS28/quintti.git
cd quintti
cargo test
stellar contract build
```

`cargo test` runs the 78 unit tests. They need no network and no accounts. `stellar contract build` writes `target/wasm32v1-none/release/quintti_treasury.wasm`.

The quality checks used before every commit:

```
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
stellar contract build
```

## 3. Deploy your own copy on testnet

This creates six throwaway testnet accounts, deploys the contract with a 2-of-3 council, and runs one complete expense. The identities are stored by the Stellar CLI on your machine, never in the repository. If an identity name already exists, `keys generate` reports it and you can reuse it.

### 3.1 Create and fund the accounts

```
stellar keys generate qt-assembly --network testnet --fund
stellar keys generate qt-admin --network testnet --fund
stellar keys generate qt-council1 --network testnet --fund
stellar keys generate qt-council2 --network testnet --fund
stellar keys generate qt-council3 --network testnet --fund
stellar keys generate qt-vendor --network testnet --fund
```

| Identity | Role in the contract |
|----------|----------------------|
| `qt-assembly` | Assembly. Sets the budget and the vendors |
| `qt-admin` | Administrator. Proposes expenses and pays the deployment fee |
| `qt-council1`, `qt-council2`, `qt-council3` | Council. Two of three must approve |
| `qt-vendor` | Vendor. Receives the payment |

### 3.2 Deploy

Create a file named `council.json` outside the repository (or any place you will not commit) with the three council addresses. Print each one with `stellar keys address qt-council1` (then `2` and `3`), and write them like this:

```json
["G...COUNCIL1", "G...COUNCIL2", "G...COUNCIL3"]
```

Passing the list as a file avoids shell quoting differences, especially in PowerShell.

```
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quintti_treasury.wasm \
  --source qt-admin --network testnet --alias quintti-dev \
  -- \
  --token $(stellar contract id asset --asset native --network testnet) \
  --assembly $(stellar keys address qt-assembly) \
  --administrator $(stellar keys address qt-admin) \
  --council-file-path council.json \
  --threshold 2
```

In PowerShell, write it on one line without the trailing `\` characters. The command prints the contract ID (it starts with `C`). The alias `quintti-dev` lets the next commands use `--id quintti-dev`.

This uses the native XLM token through its Stellar Asset Contract, so you do not need to issue a token. Amounts are in the token's smallest unit: `10000000` is 1 XLM.

### 3.3 Run a full expense

Each command below calls the contract. Add `--source <identity> --network testnet` to every one, using the identity in the first column.

| Step | `--source` | Arguments after `--` |
|------|-----------|----------------------|
| Open a budget of 1,000 XLM | `qt-assembly` | `set_budget --category maintenance --limit 10000000000` |
| Approve a vendor | `qt-assembly` | `set_vendor --vendor $(stellar keys address qt-vendor) --allowed true` |
| Fund the treasury with 500 XLM | `qt-assembly` | `deposit --from $(stellar keys address qt-assembly) --amount 5000000000` |
| Propose an expense of 80 XLM | `qt-admin` | `propose_expense --category maintenance --vendor $(stellar keys address qt-vendor) --amount 800000000 --invoice_hash 5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8` |
| First approval (stays pending) | `qt-council1` | `approve_expense --approver $(stellar keys address qt-council1) --id 0` |
| Second approval (pays the vendor) | `qt-council2` | `approve_expense --approver $(stellar keys address qt-council2) --id 0` |

A complete command looks like this:

```
stellar contract invoke --id quintti-dev --source qt-assembly --network testnet \
  -- set_budget --category maintenance --limit 10000000000
```

The `invoice_hash` above is the SHA-256 of a sample text. In the app it is the SHA-256 of the real invoice file.

Read the result at any time (any `--source` works for reads):

```
stellar contract invoke --id quintti-dev --source qt-admin --network testnet -- get_expense --id 0
stellar contract invoke --id quintti-dev --source qt-admin --network testnet -- get_budget --category maintenance
stellar contract invoke --id quintti-dev --source qt-admin --network testnet -- balance
```

After the second approval the expense is `Paid`, the budget shows `spent: 800000000`, and the treasury balance drops from 500 XLM to 420 XLM.

### 3.4 See the rules reject a payment

Proposing 950 XLM when 80 of 1,000 are already spent fails before anything is written:

```
stellar contract invoke --id quintti-dev --source qt-admin --network testnet \
  -- propose_expense --category maintenance --vendor $(stellar keys address qt-vendor) \
  --amount 9500000000 --invoice_hash 5359aa4f547c5c12e8a10a98b3e43675ff8a39a147e065784a277ed8f4845aa8
```

The command ends with `Error(Contract, #12)`, which is `OverBudget`. The full list of error codes is in [03-contract-design.md](03-contract-design.md#errors). Calling `approve_expense` with an account that is not on the council fails with `#15`.

Every call that writes prints a link to the transaction in [stellar.expert](https://stellar.expert/explorer/testnet).

## 4. Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `linker 'link.exe' not found` (Windows) | Install the Visual Studio Build Tools with the C++ workload |
| `can't find crate for 'core'` or a missing target | Run `rustup target add wasm32v1-none`, or build once inside the repository so `rust-toolchain.toml` installs it |
| `Error(Contract, #n)` | A rule rejected the call. Look up `n` in [03-contract-design.md](03-contract-design.md#errors) |
| Account not found on testnet | The identity was not funded. Run `stellar keys fund <identity> --network testnet` |
| Everything stopped working after some weeks | The testnet is reset periodically. Create new identities and deploy again |
| `Invalid JSON in argument 'council'` | Pass the council with `--council-file-path`, as shown above |

## 5. What is not here yet

The web app is not built yet, so there is no UI to run. The development plan and the current state are in [../CHANGELOG.md](../CHANGELOG.md).

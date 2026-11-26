# Contributing

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | The stable line. What the README describes and what the demo runs |
| `dev` | Where work is integrated before it reaches `main`. It is kept equal to `main` between pieces of work |

- Start a piece of work from `dev` in a short-lived branch named `feat/...`, `fix/...` or `docs/...`.
- Merge it into `dev`, then bring `dev` into `main` with a fast-forward (`git merge --ff-only dev`), so the two never diverge.
- Delete a branch once it is merged. The history keeps its commits.

## Commits

One change per commit, in English, with a prefix: `feat:`, `fix:`, `test:`, `docs:`, `chore:` or `refactor:`. No co-author trailers. Documentation and code change in the same commit when one makes the other wrong.

## Before pushing

The CI runs the same checks. From the repository root:

```
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

And from `frontend/` (Node 22.12 or newer):

```
npm run lint && npm run typecheck && npm test && npm run build
```

`npm run build` needs `frontend/.env.local`; copy `frontend/.env.example` if you do not have one.

## Decisions and documents

A design decision gets a short file in [docs/decisions/](docs/decisions/README.md). If a document and the code disagree, fix the one that is wrong in the same change. The current state of the project is in [CHANGELOG.md](CHANGELOG.md).

# Shared stream-contract routing

| Task | Read next |
| --- | --- |
| Understand exports or consumer boundaries | `docs/api.md`, `docs/architecture.md` |
| Use the package in a project | `docs/usage.md` |
| Change a shared contract | `workflows/change/CONTEXT.md` |
| Version and distribute an accepted change | `workflows/release/CONTEXT.md`, `docs/release.md` |
| Check canonical source versus distributions | `scripts/sync-consumers.ts --check` via `npm run vendor:check` |
| Validate the component | `scripts/check.ts` via `npm run check` |

Reference material is committed source, docs, configuration, and test contracts. Working artifacts belong to the selected run and do not override the user's task. This library has no credentials, live service adapters, deployment endpoint, or automatic workflow runner.

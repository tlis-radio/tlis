# videostream: local change workflow

Use this workflow for the ingest, relay, archive, or Directus contract change. For a cross-component change, select root `workflows/change` explicitly with `--scope shared`.

```sh
npm run repo -- workflow init --workflow change --scope component --component videostream --run <run-id>
```

| Stage | Job | Handoff |
| --- | --- | --- |
| `stages/01_scope/` | Define observable behavior and affected contract | `output/<run-id>/scope.md` |
| `stages/02_implement/` | Make the scoped change in project-owned code/config | `output/<run-id>/change.md` |
| `stages/03_verify/` | Check acceptance and relevant consumer compatibility | `output/<run-id>/verification.md` |

Stable local references are `docs/architecture.md`, `docs/api.md`, `docs/configuration.md`, and `docs/development.md`. Paths in stage contracts are repository-relative. Read only relevant sections.

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci`. Runtime checks use FFmpeg and the configured local Directus service; inspect only the endpoints and logs needed for the task. The workflow's `tools/` is an optional location for real helper files; `.gitkeep` means no local helper is shipped.

## Task state and transition

Follow the [shared saved-state and transition convention](../../../../docs/ai-workspace.md#save-and-resume). This workflow's stage Verify sections supply its specific acceptance criteria for advancing.

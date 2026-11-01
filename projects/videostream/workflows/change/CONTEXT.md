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

Read this workflow's `tools/` capability directory. `tools/.gitkeep` means no external/MCP tool is declared at this scope. Provider access is host configuration and task authorization. Predictable check mechanics live in component/root `scripts/`.

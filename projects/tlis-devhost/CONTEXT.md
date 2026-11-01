# Local orchestration context

| Task | Reference |
| --- | --- |
| Start local development | `docs/development.md`, `docs/configuration.md` |
| Change a resource or startup relationship | `docs/architecture.md`, `src/resources.ts`, `tests/topology.test.ts` |
| Environment or port contract | `docs/api.md`, `src/topology.ts` |
| Diagnose restore or runtime prerequisites | `docs/development.md`, `scripts/aspire.ts` |
| Staged change or test run | `workflows/local-development/CONTEXT.md` |

Load the selected stage's CONTEXT.md and the relevant references. The user's ordinary request supplies the task; no prompt template is required. Working outputs stay under that stage's `output/<run-id>/`.

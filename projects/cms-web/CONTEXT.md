# Website and dashboard: task routing

| Task | Load |
| --- | --- |
| Website, dashboard, or API behavior | Relevant `src/app`, `src/components`, or `src/services` source |
| Local check or build | `workflows/service/CONTEXT.md`, `tools/README.md` |
| Image or deployment | `Dockerfile`, root `docs/deployment.md` |
| Multi-stage feature or fix | Root `workflows/change/CONTEXT.md`, scoped project source |
| Cross-service contract | Root `shared/references/integrations.md`, relevant consumer/provider |

Stable runtime references: package.json, Dockerfile, .env.example, and relevant Next.js configuration. Load environment variable names and contracts without placing credential values in run artifacts.

Service stages live in `workflows/service/stages/`. Write working evidence to the current stage's `output/<run-id>/`; source code stays in its normal location. Use the saved output of this run, not another contributor's artifacts.

The original README remains the runtime starting point. Root deployment and branch conventions apply after import.

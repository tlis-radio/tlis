# Video streaming and archive: task routing

| Task | Load |
| --- | --- |
| OBS ingest or authentication | `src/stream-server.ts`, `src/directus-client.ts` |
| Relay or archive finalization | `src/live-relay.ts`, `src/archive-service.ts` |
| Local build or operation | `workflows/service/CONTEXT.md`, `tools/README.md` |
| Multi-stage feature or fix | Root `workflows/change/CONTEXT.md`, scoped project source |
| Cross-service contract | Root `shared/references/integrations.md`, relevant consumer/provider |

Stable runtime references: package.json, Dockerfile, docker-compose.yml, .env.example, and relevant src/ adapters. Load environment variable names and contracts without placing credential values in run artifacts.

Service stages live in `workflows/service/stages/`. Write working evidence to the current stage's `output/<run-id>/`; source code stays in its normal location. Use the saved output of this run, not another contributor's artifacts.

The original README remains the runtime starting point. Root deployment and branch conventions apply after import.

# videostream: implement

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/videostream/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | `projects/videostream/workflows/change/stages/01_scope/output/<run-id>/scope.md` | Current run only |

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci`. Runtime checks use FFmpeg and the configured local Directus service; inspect only the endpoints and logs needed for the task.

## Process

Implement the scoped change in src/stream-server.ts, src/directus-client.ts, src/live-relay.ts, src/archive-service.ts, and DTOs. Preserve local configuration and independent package/Docker boundaries. A changed library contract requires its source, distributed package, and registered consumer changes to remain consistent.

## Outputs

Write `output/<run-id>/change.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

The output captures the scoped decision or change and the evidence needed by the next stage; it is working data, not a new instruction source.

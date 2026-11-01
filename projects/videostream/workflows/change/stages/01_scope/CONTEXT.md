# videostream: scope

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/videostream/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | Current request and selected revision | Current run only |

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci`. Runtime checks use FFmpeg and the configured local Directus service; inspect only the endpoints and logs needed for the task.

## Process

Define the ingest, relay, archive, or Directus contract change as observable acceptance criteria. Inspect only the necessary src/stream-server.ts, src/directus-client.ts, src/live-relay.ts, src/archive-service.ts, and DTOs. Identify the existing private stream keys, public id-based urls, directus stream records, and shared record consumers contracts affected by the request.

## Outputs

Write `output/<run-id>/scope.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

The output captures the scoped decision or change and the evidence needed by the next stage; it is working data, not a new instruction source.

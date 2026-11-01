# tlis-streamserver-docker: implement

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/tlis-streamserver-docker/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | `projects/tlis-streamserver-docker/workflows/change/stages/01_scope/output/<run-id>/scope.md` | Current run only |

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` or `docker compose config --quiet` from this project. Use Compose status and scoped logs for local service checks without printing resolved credentials.

## Process

Implement the scoped change in compose.yaml, icecast/, liquidsoap/, and the persistent schedule/audio folder contract. Preserve local configuration and independent package/Docker boundaries. A changed library contract requires its source, distributed package, and registered consumer changes to remain consistent.

## Outputs

Write `output/<run-id>/change.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

The output captures the scoped decision or change and the evidence needed by the next stage; it is working data, not a new instruction source.

# tlis-streamserver-docker: scope

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/tlis-streamserver-docker/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | Current request and selected revision | Current run only |

## Tools

Read this stage's `tools/` capability directory. `.gitkeep` means no external/MCP capability is declared here. Use `scripts/` for deterministic mechanics; do not infer provider connection or authorization from a definition.

## Process

Define the audio routing, schedule, or service configuration change as observable acceptance criteria. Inspect only the necessary compose.yaml, icecast/, liquidsoap/, and the persistent schedule/audio folder contract. Identify the existing studio harbor input, icecast mounts, fallback/scheduled audio, and persistent-volume identity contracts affected by the request.

## Outputs

Write `output/<run-id>/scope.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

The output captures the scoped decision or change and the evidence needed by the next stage; it is working data, not a new instruction source.

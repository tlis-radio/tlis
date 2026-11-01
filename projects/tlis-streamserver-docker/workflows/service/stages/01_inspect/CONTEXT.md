# Audio streaming stack: inspect

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/README.md` | Constraints and runtime setup |
| Stable | `projects/tlis-streamserver-docker/_config/project.json`, `projects/tlis-streamserver-docker/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | Current request and selected revision | Current run only |

## Process

Identify the requested revision, service boundary, and environment assumptions. Inspect only relevant compose.yaml, icecast/, liquidsoap/, and the environment variable names used by those files. Distinguish a check from an operation and identify missing prerequisites.

## Outputs

Write `output/<run-id>/inspection.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Name the exact project/revision, affected configuration, and requested checks or operation.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

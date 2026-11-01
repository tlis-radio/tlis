# Audio streaming stack: operate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/README.md` | Constraints and runtime setup |
| Stable | `projects/tlis-streamserver-docker/_config/project.json`, `projects/tlis-streamserver-docker/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Stable | `docs/deployment.md` | Project environment and cutover |
| Working | `projects/tlis-streamserver-docker/workflows/service/stages/02_validate/output/<run-id>/validation.md` | Current run only |

## Process

Use current validation and requested target to perform only the authorized operation. This project had no original GitHub deployment workflow. Follow the deployment host's Compose process when an operation is requested. Preserve its Compose project name and named volumes. Icecast defaults to host port 8000 and Filebrowser to 8080; avoid collision with video. For preparation-only work, record remaining setup without claiming the service changed.

## Outputs

Write `output/<run-id>/operation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record the selected ref/environment, actual action and result, and recovery path. Distinguish prepared operations from executed ones.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

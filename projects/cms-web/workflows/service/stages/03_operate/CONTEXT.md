# Website and dashboard: operate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/cms-web/AGENTS.md`, `projects/cms-web/README.md` | Constraints and runtime setup |
| Stable | `projects/cms-web/_config/project.json`, `projects/cms-web/tools/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Stable | `docs/deployment.md` | Project environment and cutover |
| Working | `projects/cms-web/workflows/service/stages/02_validate/output/<run-id>/validation.md` | Current run only |

## Process

Use current validation and requested target to perform only the authorized operation. Use the website development workflow on dev, or production workflow on main. Preserve the tlis-web-dev / tlis-web image names and environment-specific deployment IDs. Discord build notifications are an optional manual input. For preparation-only work, record remaining setup without claiming the service changed.

## Outputs

Write `output/<run-id>/operation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record the selected ref/environment, actual action and result, and recovery path. Distinguish prepared operations from executed ones.

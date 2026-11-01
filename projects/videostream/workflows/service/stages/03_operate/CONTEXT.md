# Video streaming and archive: operate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/README.md` | Constraints and runtime setup |
| Stable | `projects/videostream/_config/project.json`, `projects/videostream/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Stable | `docs/deployment.md` | Project environment and cutover |
| Working | `projects/videostream/workflows/service/stages/02_validate/output/<run-id>/validation.md` | Current run only |

## Process

Use current validation and requested target to perform only the authorized operation. Use the video production workflow on main, preserving the video-stream image name and existing GET deployment method. Keep media volumes across checkout changes. RTMP uses 1935 and public media defaults to host port 8000, which can collide with Icecast. For preparation-only work, record remaining setup without claiming the service changed.

## Outputs

Write `output/<run-id>/operation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record the selected ref/environment, actual action and result, and recovery path. Distinguish prepared operations from executed ones.

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci`. Runtime checks use FFmpeg and the configured local Directus service; inspect only the endpoints and logs needed for the task.

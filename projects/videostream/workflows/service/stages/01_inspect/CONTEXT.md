# Video streaming and archive: inspect

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/README.md` | Constraints and runtime setup |
| Stable | `projects/videostream/_config/project.json`, `projects/videostream/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | Current request and selected revision | Current run only |

## Process

Identify the requested revision, service boundary, and environment assumptions. Inspect only relevant package.json, Dockerfile, docker-compose.yml, .env.example, and relevant src/ adapters. Distinguish a check from an operation and identify missing prerequisites.

## Outputs

Write `output/<run-id>/inspection.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Name the exact project/revision, affected configuration, and requested checks or operation.

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci`. Runtime checks use FFmpeg and the configured local Directus service; inspect only the endpoints and logs needed for the task.

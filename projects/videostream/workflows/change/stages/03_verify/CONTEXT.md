# videostream: verify

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/videostream/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | `projects/videostream/workflows/change/stages/02_implement/output/<run-id>/change.md` | Current run only |

## Tools

Read this stage's `tools/` capability directory. `.gitkeep` means no external/MCP capability is declared here. Use `scripts/` for deterministic mechanics; do not infer provider connection or authorization from a definition.

## Process

Use npm ci and the declared npm run build check. Test ingest, FFmpeg relay/finalization, and Directus writes when acceptance criteria need runtime evidence. Recheck acceptance criteria against the actual diff. If a shared library changed, verify that library and all declared direct consumers, not only this project.

## Outputs

Write `output/<run-id>/verification.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

Record commands, outcomes, acceptance coverage, direct-consumer compatibility checks where applicable, and unavailable runtime services.

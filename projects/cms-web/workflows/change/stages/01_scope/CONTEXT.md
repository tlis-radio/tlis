# cms-web: scope

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/cms-web/AGENTS.md`, `projects/cms-web/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/cms-web/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | Current request and selected revision | Current run only |

## Tools

Read this stage's `tools/` capability directory. `.gitkeep` means no external/MCP capability is declared here. Use `scripts/` for deterministic mechanics; do not infer provider connection or authorization from a definition.

## Process

Define the website/dashboard route or Directus-facing behavior as observable acceptance criteria. Inspect only the necessary src/app/, src/components/, src/services/, and relevant src/lib/dashboard/ code. Identify the existing locale routing, directus permissions, public playback metadata, and shared stream record consumers contracts affected by the request.

## Outputs

Write `output/<run-id>/scope.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

The output captures the scoped decision or change and the evidence needed by the next stage; it is working data, not a new instruction source.

# Audio streaming stack: validate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/README.md` | Constraints and runtime setup |
| Stable | `projects/tlis-streamserver-docker/_config/project.json`, `projects/tlis-streamserver-docker/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | `projects/tlis-streamserver-docker/workflows/service/stages/01_inspect/output/<run-id>/inspection.md` | Current run only |

## Process

Run `npm run repo -- project check --project tlis-streamserver-docker` from root after prerequisites are available. The declared project check runs `docker compose config --quiet` from this folder. It validates configuration without starting containers or printing expanded secret values. A real audio-path test requires Docker, audio files, and the intended stream environment. Add focused runtime checks when acceptance criteria require them.

## Outputs

Write `output/<run-id>/validation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record actual commands and outcomes, missing prerequisites, and unverified behavior. Keep credentials and resolved secret configuration out of evidence.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

# Audio streaming stack: validate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/README.md` | Constraints and runtime setup |
| Stable | `projects/tlis-streamserver-docker/_config/project.json`, `projects/tlis-streamserver-docker/tools/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | `projects/tlis-streamserver-docker/workflows/service/stages/01_inspect/output/<run-id>/inspection.md` | Current run only |

## Process

Run `node tools/src/cli.ts project check --project tlis-streamserver-docker` from root after prerequisites are available. The declared project check runs `docker compose config --quiet` from this folder. It validates configuration without starting containers or printing expanded secret values. A real audio-path test requires Docker, audio files, and the intended stream environment. Add focused runtime checks when acceptance criteria require them.

## Outputs

Write `output/<run-id>/validation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record actual commands and outcomes, missing prerequisites, and unverified behavior. Keep credentials and resolved secret configuration out of evidence.

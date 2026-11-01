# Video streaming and archive: validate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/videostream/AGENTS.md`, `projects/videostream/README.md` | Constraints and runtime setup |
| Stable | `projects/videostream/_config/project.json`, `projects/videostream/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | `projects/videostream/workflows/service/stages/01_inspect/output/<run-id>/inspection.md` | Current run only |

## Process

Run `npm run repo -- project check --project videostream` from root after prerequisites are available. Install dependencies here with `npm ci`; the declared project check runs `npm run build`. Runtime checks need FFmpeg and configured Directus access. A successful TypeScript build does not exercise OBS ingest, recording, or archive finalization. Add focused runtime checks when acceptance criteria require them.

## Outputs

Write `output/<run-id>/validation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record actual commands and outcomes, missing prerequisites, and unverified behavior. Keep credentials and resolved secret configuration out of evidence.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

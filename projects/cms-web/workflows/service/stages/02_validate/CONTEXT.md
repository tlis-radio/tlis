# Website and dashboard: validate

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/cms-web/AGENTS.md`, `projects/cms-web/README.md` | Constraints and runtime setup |
| Stable | `projects/cms-web/_config/project.json`, `projects/cms-web/scripts/check.ts` | Deterministic check declaration |
| Stable | `shared/references/validation.md` | Evidence and check limits |
| Working | `projects/cms-web/workflows/service/stages/01_inspect/output/<run-id>/inspection.md` | Current run only |

## Process

Run `npm run repo -- project check --project cms-web` from root after prerequisites are available. Install dependencies here with `npm ci --legacy-peer-deps`. The declared project check runs TypeScript checking. `npm run build` is the full build and may require development service settings. The imported `lint` script uses `next lint`; verify it against the installed Next.js version before claiming lint coverage. Add focused runtime checks when acceptance criteria require them.

## Outputs

Write `output/<run-id>/validation.md` relative to this stage. Use the saved handoff after human edits; avoid unrelated project context.

## Verify

Record actual commands and outcomes, missing prerequisites, and unverified behavior. Keep credentials and resolved secret configuration out of evidence.

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci --legacy-peer-deps`; use `npm run build` or focused browser/HTTP checks when relevant.

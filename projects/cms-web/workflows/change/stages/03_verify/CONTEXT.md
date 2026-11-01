# cms-web: verify

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/cms-web/AGENTS.md`, `projects/cms-web/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/cms-web/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | `projects/cms-web/workflows/change/stages/02_implement/output/<run-id>/change.md` | Current run only |

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci --legacy-peer-deps`; use `npm run build` or focused browser/HTTP checks when relevant.

## Process

Install dependencies with npm ci --legacy-peer-deps, then use the declared TypeScript check. Run the full build or a focused UI/Directus check when the acceptance criteria require it. Recheck acceptance criteria against the actual diff. If a shared library changed, verify that library and all declared direct consumers, not only this project.

## Outputs

Write `output/<run-id>/verification.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

Record commands, outcomes, acceptance coverage, direct-consumer compatibility checks where applicable, and unavailable runtime services.

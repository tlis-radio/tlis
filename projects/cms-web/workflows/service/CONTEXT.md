# Website and dashboard: service workflow

Use the stages relevant to the requested validation or operation. A feature's scope and implementation plan use the shared change workflow instead of duplicating it here.

| Stage | Job | Output |
| --- | --- | --- |
| `stages/01_inspect/` | Identify revision, configuration, and service boundary | `output/<run-id>/inspection.md` |
| `stages/02_validate/` | Check locally and record runtime gaps | `output/<run-id>/validation.md` |
| `stages/03_operate/` | Perform a requested operation or prepare its handoff | `output/<run-id>/operation.md` |

Initialize a local service run from the repository root:

```sh
npm run repo -- workflow init --workflow service --project cms-web --run <run-id>
```

Paths in stage contracts are repository-relative. Use one run ID through handoffs. Create its output directory when first writing evidence; saved output may be edited before the next stage.

Project boundary: Directus and website build arguments. Use the website development workflow on dev, or production workflow on main. Preserve the tlis-web-dev / tlis-web image names and environment-specific deployment IDs. Discord build notifications are an optional manual input.

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` from this project after `npm ci --legacy-peer-deps`; use `npm run build` or focused browser/HTTP checks when relevant. The workflow's `tools/` is an optional location for real helper files; `.gitkeep` means no local helper is shipped.

## Task state and transition

Follow the [shared saved-state and transition convention](../../../../docs/ai-workspace.md#save-and-resume). This workflow's stage Verify sections supply its specific acceptance criteria for advancing.

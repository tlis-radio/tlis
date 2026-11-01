# Shared change workflow

Use this workflow for work that benefits from a clear scope, a plan, and reviewable evidence. Select only the stages needed for the size of the task. A run ID is a unique slug for this work item, not a reusable global output folder.

Initialize a run from the repository root:

```sh
node scripts/src/cli.ts workflow init --workflow change --component <project> --run <run-id> --scope shared
```

| Stage | Job | Handoff |
| --- | --- | --- |
| `stages/01_scope/` | Turn the request into observable acceptance criteria | `output/<run-id>/scope.md` |
| `stages/02_plan/` | Decide the narrow implementation and checks | `output/<run-id>/plan.md` |
| `stages/03_implement/` | Make the scoped code and configuration change | `output/<run-id>/change.md` |
| `stages/04_verify/` | Check the behavior and record evidence | `output/<run-id>/verification.md` |
| `stages/05_release/` | Prepare PR/release information or requested rollout | `output/<run-id>/release.md` |

Each stage has a `CONTEXT.md` contract and reusable `prompt.md`. Paths in contracts are repository-relative unless explicitly marked stage-relative. Load the selected project's context, not every project. Outputs belong to the current run and remain editable. Use the latest saved artifact after any human edit.

Stages provide review points. Honor review gates agreed for the run and existing authorization; completing a stage does not imply permission to deploy or send messages. Maintenance scripts prepare and verify files. Capability APIs are selected from each workflow/stage tools/ directory; neither directory launches an autonomous agent.

## Tools

Read this scope's tools/ entries before selecting an external capability. A tools/.gitkeep placeholder means no external/MCP capability is assigned. Read only an imported wrapper's input/output contract, then compose calls as TypeScript when useful. Repository checks and file operations use scripts/ and are separate from external tool authorization.

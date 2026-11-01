# Release stage

Paths below are repository-relative. Read only the needed sections and selected project's files.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `AGENTS.md`, `projects/<project>/AGENTS.md` | Applicable constraints |
| Stable | `projects/<project>/CONTEXT.md` | Relevant subsystem route |
| Stable | `shared/references/engineering.md` | Project boundaries and tools |
| Working | `workflows/change/stages/04_verify/output/<run-id>/verification.md` | Current run only |
| Working | `workflows/change/stages/01_scope/output/<run-id>/scope.md` | Acceptance criteria |

Use `docs/development.md` and, only for rollout, `docs/deployment.md`.

## Process

Prepare reviewer-facing behavior, validation, and rollout information. Feature PRs target dev; a release PR promotes dev to main. Follow a project's operation workflow only for requested rollout; otherwise state remaining setup.

## Outputs

Write `output/<run-id>/release.md` relative to this stage. Keep evidence concise and free of credentials. The next stage reads the latest saved version, including human edits.

## Verify

Distinguish completed work from unperformed rollout. For an executed operation, record its ref, environment, outcome, and recovery path.

## Tools

Use Git and the host's GitHub integration or installed CLI to prepare a reviewable commit/PR. Use manual GitHub Actions for requested validation; deployment uses the documented manual entrypoint and current task authorization.

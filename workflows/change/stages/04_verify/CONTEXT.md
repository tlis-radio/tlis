# Verify stage

Paths below are repository-relative. Read only the needed sections and selected project's files.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `AGENTS.md`, `projects/<project>/AGENTS.md` | Applicable constraints |
| Stable | `projects/<project>/CONTEXT.md` | Relevant subsystem route |
| Stable | `shared/references/engineering.md` | Project boundaries and tools |
| Working | `workflows/change/stages/03_implement/output/<run-id>/change.md` | Current run only |
| Working | `workflows/change/stages/01_scope/output/<run-id>/scope.md` | Acceptance criteria |

Use `shared/references/validation.md` when selecting checks.

## Process

Run checks that demonstrate the requested behavior. Use project check for declared static checks, then add focused runtime checks where acceptance criteria require them. Routine external-service tests use fake adapters or fixtures.

## Outputs

Write `output/<run-id>/verification.md` relative to this stage. Keep evidence concise and free of credentials. The next stage reads the latest saved version, including human edits.

## Verify

Record exact commands, outcomes, acceptance coverage, and missing runtimes or services. A history, architecture, or typecheck pass does not imply a deployed service works.

## Tools

Use the affected project's declared check/build commands and focused runtime checks. Run root `npm run check`, `npm test`, and architecture verification when shared repository code changes. Use Git diff to review acceptance coverage.

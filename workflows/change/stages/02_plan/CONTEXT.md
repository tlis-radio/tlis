# Plan stage

Paths below are repository-relative. Read only the needed sections and selected project's files.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `AGENTS.md`, `projects/<project>/AGENTS.md` | Applicable constraints |
| Stable | `projects/<project>/CONTEXT.md` | Relevant subsystem route |
| Stable | `shared/references/engineering.md` | Project boundaries and tools |
| Working | `workflows/change/stages/01_scope/output/<run-id>/scope.md` | Current run only |


## Process

Inspect the necessary source and contracts. Choose the narrow implementation boundary, name affected files or slices, and identify checks for each acceptance criterion. Separate an external service port from its provider adapter.

## Outputs

Write `output/<run-id>/plan.md` relative to this stage. Keep evidence concise and free of credentials. The next stage reads the latest saved version, including human edits.

## Verify

Each acceptance criterion has an implementation and meaningful check. Explain material tradeoffs without inventing a framework for a local change.

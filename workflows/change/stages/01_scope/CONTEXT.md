# Scope stage

Paths below are repository-relative. Read only the needed sections and selected project's files.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `AGENTS.md`, `projects/<project>/AGENTS.md` | Applicable constraints |
| Stable | `projects/<project>/CONTEXT.md` | Relevant subsystem route |
| Stable | `shared/references/engineering.md` | Project boundaries and tools |
| Working | Current user request | Current run only |


## Process

Identify the affected project, observable behavior, smallest useful acceptance criteria, and unresolved choices that change the implementation. Separate confirmed facts from assumptions.

## Outputs

Write `output/<run-id>/scope.md` relative to this stage. Keep evidence concise and free of credentials. The next stage reads the latest saved version, including human edits.

## Verify

The scope names the project, intended behavior, acceptance checks, and material unknowns.

## Tools

Use harness read/search tools and `git diff` to locate affected behavior. The repository component registry and `npm run repo -- components list` help route the request.

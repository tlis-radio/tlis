# Implement stage

Paths below are repository-relative. Read only the needed sections and selected project's files.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `AGENTS.md`, `projects/<project>/AGENTS.md` | Applicable constraints |
| Stable | `projects/<project>/CONTEXT.md` | Relevant subsystem route |
| Stable | `shared/references/engineering.md` | Project boundaries and tools |
| Working | `workflows/change/stages/02_plan/output/<run-id>/plan.md` | Current run only |


## Process

Make the scoped source, configuration, and documentation edits. Keep project-specific behavior in its project and shared mechanics in root tools. Preserve lockfiles and Docker contexts unless the task changes them.

## Outputs

Write `output/<run-id>/change.md` relative to this stage. Keep evidence concise and free of credentials. The next stage reads the latest saved version, including human edits.

## Verify

Record what changed, why, and any plan deviation. Point to the diff instead of duplicating large source files.

## Tools

Use harness edit and terminal tools, Git, and the affected project's existing scripts. Use a configured MCP connection directly when it supplies context or an action needed by this task.

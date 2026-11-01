# Local development workflow

Use this workflow to prepare, start, and verify the Aspire dev-time topology. Select only the resource profile needed for the task.

| Stage | Job | Handoff |
| --- | --- | --- |
| 01_prepare | Validate prerequisites, local settings, and SDK | output/<run-id>/preparation.md |
| 02_run | Start the selected local resources through Aspire | output/<run-id>/run.md |
| 03_verify | Check readiness, application contracts, and shutdown | output/<run-id>/verification.md |

Each stage has a prompt, explicit context, and its own tools/ capability directory. Preserve per-run outputs and avoid loading unrelated projects.

## Tools

Read tools/ for capabilities shared by this workflow and the selected stage's tools/ for scoped additions. A .gitkeep means no external/MCP capability is assigned. Aspire and npm commands are maintenance/runtime scripts, not implicit external tool authority.

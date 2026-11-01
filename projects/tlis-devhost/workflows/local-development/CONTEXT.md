# Local development workflow

Use this workflow to prepare, start, and verify the Aspire dev-time topology. Select only the resource profile needed for the task.

| Stage | Job | Handoff |
| --- | --- | --- |
| 01_prepare | Validate prerequisites, local settings, and SDK | output/<run-id>/preparation.md |
| 02_run | Start the selected local resources through Aspire | output/<run-id>/run.md |
| 03_verify | Check readiness, application contracts, and shutdown | output/<run-id>/verification.md |

Each stage's CONTEXT.md gives the AI its inputs, process, tools, and expected result. Preserve per-run outputs and avoid loading unrelated projects.

## Tools

Use harness file/search/edit tools and Git, plus this project's `npm run restore`, `npm run plan`, `npm run check`, and `npm run dev` commands. Use the Aspire dashboard, scoped resource logs, and local HTTP health checks to verify running services. The workflow's `tools/` is an optional location for real helper files; `.gitkeep` means no local helper is shipped.

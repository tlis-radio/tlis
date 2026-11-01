# TLIS shared agent guide

Applications and the development host live in `projects/`. Reserve `libraries/` for meaningful shared code; small project-specific types can stay local.

- The user describes the desired outcome in normal chat. Do not require prompt templates, run IDs, or workflow ceremony.
- Read `CONTEXT.md`, then the selected project's guidance and relevant reference docs. Load only what the task needs.
- Stage `CONTEXT.md` files instruct the AI through inputs, useful tools, process, and outputs. They are not forms for the user.
- Codex or Claude Code already provides the harness. Use its file, search, terminal, and configured MCP tools, plus existing scripts. Do not build a second agent runtime, generic MCP client, or capability registry without a concrete need.
- If delegation helps, the AI writes a specific subtask prompt with scope, inputs, constraints, and expected output. Save it with run artifacts only when useful; do not keep generic human-entry prompt files.
- Every `CLAUDE.md` contains only `@AGENTS.md`.
- Branch `feature/<name>` from `dev`, target feature PRs at `dev`, and promote reviewed releases to `main`. Leave `archive/*` history intact.
- Preserve independent project locks and Docker contexts. Extract a library for substantial reuse, not merely a matching interface or enum.
- Use workflow stages for substantial work; small edits may go directly to implementation and verification. Separate stable references from working outputs.
- GitHub workflows remain manual-only, with optional branch/path triggers commented.
- Validate affected behavior and real consumers. Report actual results and missing services; layout/history checks do not prove runtime behavior.
- Do not alter immutable migration maps or expose credentials in logs, handoffs, public DTOs, or images. External actions follow the current task's authorization.

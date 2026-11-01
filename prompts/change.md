# Scoped change prompt

Use this prompt with Codex or Claude Code after replacing the fields.

> Implement **<requested behavior>** in **<project name>**. Acceptance criteria: **<observable outcomes>**.
>
> Read the root `AGENTS.md` and `CONTEXT.md`, then that project's `AGENTS.md` and `CONTEXT.md`. Follow the relevant stages in `workflows/change/CONTEXT.md`; use run ID **<run-id>**. Load only each stage's declared inputs and needed source files. Keep stable references separate from working artifacts.
>
> Use the repository TypeScript tools for deterministic operations. Respect the run's agreed review points and current task authorization. Validate affected behavior and report actual results and remaining setup.

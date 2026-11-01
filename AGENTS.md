# TLIS shared agent guide

TLIS contains independently deployable projects under `projects/`. Keep project code, runtime configuration, and project-specific prompts, workflows, and tools inside the project. Shared context and tools belong at the repository root.

- Read `CONTEXT.md` to route the task, then the relevant project's `AGENTS.md` and `CONTEXT.md`. Load only the workflow stage and references needed for the current work.
- `CLAUDE.md` files contain only `@AGENTS.md`. Edit the shared instructions in `AGENTS.md`; do not maintain a second Claude instruction set.
- Use `dev` for integration. Start `feature/<name>` from `dev`, open feature PRs against `dev`, and promote a reviewed release from `dev` to `main`. Historical `archive/*` branches are reference snapshots.
- Keep project lockfiles and Docker contexts independent. Use `_config/projects.json` for project discovery and `projects/<name>/_config/project.json` for its deterministic check command.
- Prefer existing TypeScript tools for repeatable selection, validation, file operations, and service calls. Run them with Node 24; keep credentials in environment variables.
- For multi-stage work, follow `workflows/change/CONTEXT.md`. Stage contracts distinguish stable references from per-run inputs. Write handoffs under that stage's `output/<run-id>/`; respect review points agreed for the run. Small edits may use only the relevant stages.
- GitHub workflows are manual-only. Keep optional branch/path triggers commented until the team chooses to enable them. Only root `.github/workflows/` files are active GitHub workflows.
- Validate changed behavior using the affected project's commands and root tooling checks where relevant. Record actual results and missing services; history verification does not prove runtime behavior.
- Do not rewrite imported history or edit migration maps during feature work. The original streamserver tracked environment files; credential cleanup is a separate change.
- Preserve private OBS keys and Discord/calendar credentials. Public responses and logs must not contain them. Deployments and external messages require task authorization; a workflow file or prompt alone does not grant it.

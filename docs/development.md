# Branching and development

The active branch model is `main`, `dev`, and `feature/<name>`.

| Branch | Purpose | Normal destination |
| --- | --- | --- |
| `main` | Reviewed release state | Production deployment selected manually |
| `dev` | Integrated work for the next release | Release PR to `main` |
| `feature/<name>` | One scoped change, based on `dev` | PR to `dev` |
| `archive/*` | Imported historical snapshots | Reference only |

## Create a change

```sh
git fetch origin
git switch dev
git pull --ff-only
npm run repo -- branch feature --name calendar-events
```

The feature tool requires the current branch to be `dev` and the worktree to be clean. It creates a branch; it does not pull, reset, delete work, or silently switch to `dev`. Use a separate worktree when another task is already active.

Read the relevant project's context, implement the change, and use its declared checks. Use the shared change workflow for work that benefits from explicit scope, a plan, and reviewable evidence. Keep changes spanning services together when they implement one interface change.

Open a feature PR against `dev`. Describe resulting behavior, affected projects, and actual validation. Select the manual verification workflow on the feature branch when relevant; the active workflows do not run automatically for pushes or PRs.

## Release

Create a release PR from `dev` to `main` after integration checks. Preserve the branch relationship with a merge commit rather than repeatedly squash-merging the release PR; synchronize `main` back into `dev` after release if needed. Select the production workflow on `main` only after its environments and secrets are configured. Development deployment uses `dev`.

GitHub branch names do not enforce this policy. Configure repository rules for PR review, branch deletion protection, and allowed merge methods in GitHub if the team wants enforcement. Do not require a path-filtered workflow as an always-required check without handling skipped runs.

Historical import branches are independent snapshots of their source projects. New work starts from `dev`, where all projects and shared tooling are present.

## Context and outputs

Describe the desired result in ordinary chat. The AI selects relevant context and stages. If saved handoffs help a substantial change, it can optionally initialize a run with:

```sh
npm run repo -- workflow init --workflow change --scope shared --component cms-web --run dashboard-fix
```

Run IDs are unique slugs for a work item. Stage handoffs live in that stage's `output/<run-id>/`; do not overwrite another contributor's run. A handoff records decisions and evidence, not secrets or unrestricted transcripts. Commit durable, sanitized decisions when they help future contributors.

For a project service operation, the same initializer finds that project's local workflow:

```sh
npm run repo -- workflow init --workflow service --project videostream --run archive-check
```

The Discord bot uses its local `add-feature` workflow for a vertical slice or integration. The generated `run.json` records the selected project, branch, stage contexts, and output paths. It is a working artifact, not a new instruction source.

## Components and compatibility

`_config/projects.json` registers projects and libraries and their declared `dependsOn` relationships. Use `npm run repo -- components list` for discovery. A component-local workflow wins by default; add `--scope shared` or `--scope component` to select that layer explicitly.

The `libraries/` area is currently empty. Keep small types local; extract shared behavior only when its reuse warrants the packaging and maintenance. For a future shared library, declare consumers and validate them together. Use `changes --base <ref> --head <ref>` to select affected components, then inspect runtime coupling not captured by dependency metadata.

Use the `tlis-devhost` project for coordinated local development. Its own README lists Aspire/runtime/Docker requirements and resource selection. Individual project development remains available.

The manual `validate-project.yml` workflow can validate one project or library. `validate-affected.yml` compares its explicit base/head refs, selects changed components plus their transitive consumers, and validates each in a separate job. The selected head is also the code checked out for validation. These workflows remain manual-only; no push or PR automatically starts them.

## Tool and script definitions

Stage `CONTEXT.md` files give the AI instructions, useful tools, references, and expected outputs. There are no generic prompt templates for people to fill out. When delegating, the AI writes a prompt tailored to that subtask; it may save it with the run evidence when useful.

Use TypeScript maintenance programs under `scripts/` for repeatable work. The canonical root command is `npm run repo -- ...`; the older `npm run tool -- ...` alias remains for compatibility. Codex or Claude Code supplies file, terminal, and configured MCP tools. Workflow `tools/` folders can hold real helpers and otherwise contain `.gitkeep`; no custom MCP client, provider registry, or additional agent runtime is needed.

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

Initialize a substantial change with:

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

When changing `libraries/stream-contracts`, follow its local packaging/release workflow. Check its source against distributed archives and run the checks for cms-web and videostream, its declared direct consumers. Keep all consumer archive/lockfile updates in the same scoped change. Use `changes --base <ref> --head <ref>` to select affected components, then inspect additional runtime coupling that cannot be inferred from dependency metadata.

Use the `tlis-devhost` project for coordinated local development. Its own README lists Aspire/runtime/Docker requirements and resource selection. Individual project development remains available.

The manual `validate-project.yml` workflow can validate one project or library. `validate-affected.yml` compares its explicit base/head refs, selects changed components plus their transitive consumers, and validates each in a separate job. The selected head is also the code checked out for validation. These workflows remain manual-only; no push or PR automatically starts them.

## Tool and script definitions

Every agent workflow and numbered stage has a context, prompt, and scoped `tools/` directory. The tools directory describes external/MCP capabilities; a tracked `.gitkeep` means none are declared there. The repository currently configures no real MCP provider servers. Inspect the selected scope instead of loading the whole catalog.

Use TypeScript maintenance programs under `scripts/` for repeatable work. The canonical root command is `npm run repo -- ...`; the older `npm run tool -- ...` alias remains for compatibility. A prompt or capability definition never starts a provider or performs an operation on its own.

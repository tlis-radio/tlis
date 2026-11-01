# TLIS

One repository for TLIS services, with project-owned code and a shared, file-based workflow for coding agents.

| Project | Purpose |
| --- | --- |
| [cms-web](projects/cms-web/) | Next.js website and dashboard |
| [tlis-streamserver-docker](projects/tlis-streamserver-docker/) | Icecast, Liquidsoap, and Filebrowser |
| [videostream](projects/videostream/) | OBS ingest, live output, and video archive |
| [tlis-discord-bot](projects/tlis-discord-bot/) | TypeScript Discord bot with vertical slices and calendar integration |

## Layout

```text
AGENTS.md                 shared instructions
CLAUDE.md                 only @AGENTS.md
CONTEXT.md                task routing
.agents/skills/           canonical reusable skills
.claude/skills/           links to those same skills
_config/                  project registry
shared/references/        stable cross-project conventions
prompts/                  reusable task entry prompts
workflows/change/         numbered stages and context contracts
tools/                    deterministic TypeScript tools
projects/<project>/       code plus local context, workflows, prompts, tools
.github/workflows/        manual GitHub Actions entrypoints
docs/                     architecture, branching, deployment, migration
```

The layout adapts Interpretable Context Methodology (ICM): load a small routing file, then a stage's explicit inputs, and write a reviewable handoff file. Stable references stay separate from each run's working artifacts. See [architecture](docs/architecture.md) for the mapping and limits.

## Start working

Use Node 24 for shared tooling. Install root tooling dependencies separately from project dependencies:

```sh
npm ci
node tools/src/cli.ts projects list
node tools/src/cli.ts architecture check
```

For new work, update and check out `dev`, then create a feature branch from it:

```sh
git switch dev
git pull --ff-only
node tools/src/cli.ts branch feature --name calendar-events
```

Feature PRs target `dev`. A release PR promotes `dev` to `main`. The branch tool requires a clean working tree and does not switch branches behind your back. See [development](docs/development.md).

For a multi-stage change:

```sh
node tools/src/cli.ts workflow init --workflow change --project cms-web --run dashboard-fix
```

Read [the change workflow](workflows/change/CONTEXT.md), then the selected project's instructions. You can use [the reusable change prompt](prompts/change.md) with either agent. Run outputs are local by default; commit only deliberate, sanitized handoffs.

## Project checks

Each project retains its own dependency installation, lockfile, and Docker context. Follow its README, then run its declared check from the root:

```sh
node tools/src/cli.ts project check --project videostream
```

The shared tool dispatches the project's TypeScript check entrypoint; it does not install dependencies, launch services, or deploy. Root checks are:

```sh
npm run check
npm test
npm run verify:history
```

The audio and video stacks both use host port `8000` by default. Choose a port override before running both locally. Existing streamserver environment files were tracked in its source history; review credentials before running it.

## Automation and history

All active GitHub workflows use **Run workflow** (`workflow_dispatch`). Their commented examples show how to enable branch and folder filters later. Existing website and video builds retain their project Docker contexts and image names. [Deployment setup](docs/deployment.md) covers secrets, environments, and the operational cutover.

The three imported repositories retain their rewritten Git histories under `projects/<name>/`, with migration maps in [docs/migration](docs/migration/). The source repositories remain unchanged. Git history does not copy GitHub secrets, settings, issues, or deployment configuration.

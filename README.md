# TLIS

A monorepo for TLIS services and shared libraries, with component-owned documentation and inspectable workflows for humans, Codex, and Claude Code.

| Component | Purpose |
| --- | --- |
| [cms-web](projects/cms-web/) | Next.js website/dashboard |
| [tlis-streamserver-docker](projects/tlis-streamserver-docker/) | Icecast, Liquidsoap, Filebrowser |
| [videostream](projects/videostream/) | OBS ingest, public video relay, archive |
| [tlis-discord-bot](projects/tlis-discord-bot/) | TypeScript vertical slices and calendar integration |
| [tlis-devhost](projects/tlis-devhost/) | Local Aspire application orchestration |
| [stream-contracts](libraries/stream-contracts/) | Shared lifecycle and generic stream-record types |

## Repository map

```text
AGENTS.md / CLAUDE.md      shared policy / reference-only Claude adapter
CONTEXT.md                task routing
projects/<name>/          deployable code, docs, workflows, prompts, scripts
libraries/<name>/         reusable code, docs, workflows, scripts
workflows/                shared numbered agent workflows
  <workflow>/
    CONTEXT.md            workflow routing
    prompt.md             reusable entry prompt
    tools/                external/MCP capability definitions or .gitkeep
    stages/01_<job>/      CONTEXT.md, prompt.md, tools/, output/<run-id>/
tools/                    capability catalog and programmatic MCP adapters
scripts/                  deterministic TypeScript maintenance/verification
shared/references/        stable cross-component conventions
.agents/skills/           canonical reusable skills
.claude/skills/           links to the canonical skills
_config/projects.json    components and declared dependencies
.github/workflows/        manually triggered GitHub Actions
docs/                     shared architecture and operating references
```

`tools/` describes external capabilities; `scripts/` performs predictable repository work. A definition is not a configured connection or permission grant. Empty workflow/stage capability directories contain `.gitkeep`.

## Start working

Use Node 24 and install root script dependencies separately from component dependencies:

```sh
npm ci
npm run repo -- components list
npm run repo -- architecture check
git switch dev
git pull --ff-only
npm run repo -- branch feature --name calendar-events
```

Feature PRs target `dev`; a release PR promotes `dev` to `main`. The branch script requires a clean worktree and does not silently switch to `dev`.

A component-local workflow is selected when present. Force the shared change workflow explicitly for cross-component work:

```sh
npm run repo -- workflow init --workflow change --scope shared --component cms-web --run dashboard-fix
```

Read the selected workflow's inputs, prompt, and scoped capability definitions. Working artifacts live in per-run output folders. See [architecture](docs/architecture.md) and [development](docs/development.md).

## Local development and checks

Follow the [Aspire devhost](projects/tlis-devhost/README.md) for local service orchestration and its prerequisites. Individual project development remains supported from each project's folder; the devhost does not replace production deployment.

```sh
npm run repo -- component check --component stream-contracts
npm run repo -- project check --project videostream
npm run check
npm test
npm run verify:history
```

A changed shared library must also be checked against its registered direct consumers. `stream-contracts` is consumed by cms-web and videostream using local versioned archives so each application retains its own lockfile and Docker context.

[Documentation index](docs/README.md) routes to architecture, APIs/service contracts, configuration, and development for every component. Audio and video both default to host port 8000 outside the devhost; choose distinct local mappings.

All active GitHub workflows are manual-only, with commented branch/folder trigger examples. [Deployment setup](docs/deployment.md) covers secrets, environments, images, and cutover. Original Git histories and mappings remain under [migration records](docs/migration/); importing history does not copy GitHub settings or credentials.

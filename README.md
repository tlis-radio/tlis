# TLIS

TLIS services with project-owned documentation and readable AI workflow context.

| Project | Purpose |
| --- | --- |
| [cms-web](projects/cms-web/) | Website and dashboard |
| [tlis-streamserver-docker](projects/tlis-streamserver-docker/) | Icecast, Liquidsoap, Filebrowser |
| [videostream](projects/videostream/) | OBS ingest, relay, archive |
| [tlis-discord-bot](projects/tlis-discord-bot/) | TypeScript bot with calendar integration |
| [tlis-devhost](projects/tlis-devhost/) | Aspire local development orchestration |

## Working with an AI

Describe what you want normally, for example: “Fix the video archive filenames and check that existing playback still works.”

Codex or Claude Code reads `AGENTS.md`, routes through `CONTEXT.md`, loads the relevant reference docs, and uses its tools plus existing scripts. Stage contexts help with larger tasks. You do not need to fill templates or select stages yourself. If the AI delegates, it writes that subtask's prompt.

## Layout

```text
AGENTS.md / CLAUDE.md   instructions / import of those instructions
CONTEXT.md             routing
projects/<name>/       source, docs, configuration, scripts, local workflows
libraries/             reserved for meaningful shared code
workflows/             shared stages instructed by CONTEXT.md
scripts/               actual checks, Git helpers, and deployment programs
shared/references/     stable conventions
.agents/skills/        reusable guidance
.claude/skills/        links to the same skills
.github/workflows/     manual GitHub Actions
docs/                  shared guides and reference index
```

Workflow-local `tools/` locations can hold real helpers; empty ones contain `.gitkeep`. There is no custom MCP client, provider catalog, or extra agent framework. There is currently no extracted shared application library.

## Development

Use Node 24 and install dependencies separately in the root and each project:

```sh
npm ci
npm run check
npm test
npm run verify:architecture
npm run verify:history
```

New work follows `feature/<name> → dev → main`. See [development](docs/development.md), the [Aspire devhost](projects/tlis-devhost/README.md), and the [documentation index](docs/README.md).

GitHub workflows are manual-only. [Deployment guidance](docs/deployment.md) covers environments, secrets, and cutover. Original histories and mappings remain in [migration records](docs/migration/).

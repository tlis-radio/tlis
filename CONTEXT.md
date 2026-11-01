# TLIS task routing

Start with the user's ordinary request. Select the project and references that help; do not require a structured prompt or preload every workflow.

| Task | Read |
| --- | --- |
| Cross-project change | `workflows/change/CONTEXT.md` and relevant project context |
| Website/dashboard | `projects/cms-web/CONTEXT.md`, then its docs index |
| Audio streaming | `projects/tlis-streamserver-docker/CONTEXT.md`, then its docs |
| OBS/video/archive | `projects/videostream/CONTEXT.md`, then its docs |
| Discord/calendar | `projects/tlis-discord-bot/CONTEXT.md`, then its docs |
| Local orchestration | `projects/tlis-devhost/CONTEXT.md` |
| Reference documentation | `docs/README.md` |
| Repository checks/branching | `scripts/README.md` |
| Future shared code | `libraries/README.md` |
| Release/deployment | `docs/development.md`, `docs/deployment.md` |
| Imported history | `docs/migration/README.md` |

The harness supplies file, search, terminal, and configured MCP tools. Stage Tools sections name useful existing commands. A workflow's optional `tools/` location is for a real helper, with `.gitkeep` while empty; it is not a provider registry.

Stable references live in project docs and `shared/references/`. Stage outputs are working data. When delegating, the AI creates a focused subtask prompt from the request and context. No root prompt templates are required.

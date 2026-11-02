# Agent context and local development orchestration

This report records the original implementation and its validation. The Aspire host has since been removed; use the current [development guide](../development.md) and each service's local commands for setup.

The existing Codex or Claude Code harness reads the relevant workflow and project files for each ordinary chat request. Stage `CONTEXT.md` files provide instructions, references, useful tools, and expected results. Generic prompt templates have been removed; when delegation helps, the AI writes a prompt for that specific subtask. Saved run handoffs are optional.

Repository maintenance and deployment helpers live in `scripts/`. Workflows identify actual harness tools and project commands, and retain a workflow-local `tools/.gitkeep` for a future concrete helper. There is no custom MCP client, provider registry, or second agent runtime.

`libraries/` is reserved for meaningful future shared code. The small stream interfaces and enum remain in the website and video projects, with their independent lockfiles and Docker contexts. No shared contract package or vendor archives are required. Component dependency tracking can support a future library and selects declared consumers when needed.

All five projects have local architecture, API/service-contract, configuration, and development references. Their local workflows preserve project scope; shared changes use the root workflow. Canonical instructions remain in `AGENTS.md`, with `CLAUDE.md` importing them. Six root Actions workflows are manual-only and retain commented branch/path examples. Component validation installs and checks each selected project independently.

`projects/tlis-devhost` provides Aspire 13.6 TypeScript orchestration. The default topology starts the website and an offline Discord bot, with an existing local Directus reference. Audio containers and the video process are explicit opt-ins. The generated Aspire SDK is restored locally and ignored in Git; each application keeps its own working directory, packages, configuration, and ports.

## Validation

- Root TypeScript checking and 19 tests passed, covering dependency impact, workflow selection and isolated outputs, path/branch handling, manual workflow parsing, and deployment request construction.
- Website production build and video TypeScript build passed after clean dependency installations, with their original local stream types restored.
- Discord bot typechecking, 12 offline tests, and build passed.
- Aspire generated-SDK typechecking and five topology tests passed.
- All six Actions definitions passed actionlint. Architecture checks covered five projects, nine context-driven workflows, canonical Claude adapters, and project reference documents.
- Migration verification preserved all 563 source commits and 40 historical refs, including metadata, trees, and parent graphs. Migration maps remain unchanged.
- New documentation links resolve. Nine existing links inside the imported website dashboard implementation note remain outside this change.

The Aspire topology was also started locally during implementation: the website's `/api/album-art` endpoint returned its expected empty-artwork response, and the offline bot's `/health` endpoint returned its health response. Shutdown released both application ports. These checks do not cover Directus-backed pages, Discord/calendar connections, or the opt-in Docker/FFmpeg resources. The WSL runtime required an isolated official Ubuntu ICU package for the Aspire dashboard; setup is documented in the devhost references.

The existing website and video dependency audit findings remain a separate maintenance task. No production deployment, Discord registration, or calendar mutation is part of validation.

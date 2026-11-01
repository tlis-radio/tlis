# Choosing validation

Validate changed behavior using the component's local declaration and documented interfaces.

| Area | Check | Limit or prerequisite |
| --- | --- | --- |
| Shared TypeScript scripts/MCP client | Root `npm run check`, `npm test` | Root dependencies; provider tests use fakes |
| Layout, docs, workflow capabilities | `npm run repo -- architecture check` | Working skill links and required context/prompt/tools surfaces |
| Imported history | `npm run verify:history` | Full clone with historical refs |
| Website | `project check --project cms-web` | Installed website dependencies; static checking does not test Directus/UI |
| Video | `project check --project videostream` | Installed dependencies; build does not run FFmpeg/Directus |
| Audio | `project check --project tlis-streamserver-docker` | Docker Compose; quiet config check does not start audio |
| Discord bot | `project check --project tlis-discord-bot` | Typecheck, offline tests, build; no registration or live messages |
| Stream contracts | `component check --component stream-contracts` | Source/package parity and library checks, then declared consumers |
| Aspire devhost | Its declared component check and local docs | Aspire/runtime prerequisites; a graph check does not prove all services are ready |

Subcommands above use `npm run repo -- ...`. Component checks do not install credentials or provision Directus. Report missing services explicitly.

For a changed shared library, validate its versioned distribution and each declared direct consumer. `stream-contracts` currently lists cms-web and videostream. Keep local archive and consumer lock updates consistent. The component registry describes declared direct dependencies, not every possible runtime relationship.

Use `changes --base <ref> --head <ref>` to identify affected components and consumers, then inspect undocumented interface effects. Record exact commands, outcomes, acceptance coverage, and material gaps in the run's verification artifact.

Capability definitions are not tests of a live provider. A workflow/stage `tools/.gitkeep` is an intentionally empty external-tool set. No real MCP servers are configured by this repository; the programmatic client tests use local/fake transport behavior.

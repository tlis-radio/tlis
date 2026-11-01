# Choosing validation

Validate the affected behavior, using the project's local declaration and context.

| Area | Check | Prerequisite or limit |
| --- | --- | --- |
| Shared TypeScript tools | `npm run check`, `npm test` at root | Root `npm ci` |
| Repository layout and contexts | `node tools/src/cli.ts architecture check` | Working skill symlinks |
| Imported history | `npm run verify:history` | Full clone with all historical refs |
| Website | `project check --project cms-web` | Website dependencies installed with `--legacy-peer-deps`; full build may require service configuration |
| Video | `project check --project videostream` | Video dependencies; build does not exercise FFmpeg or Directus |
| Audio stack | `project check --project tlis-streamserver-docker` | Docker Compose; config validation does not launch containers |
| Discord bot | Its `check`, `test`, and `build` scripts | Bot dependencies; fake adapters cover routine checks |

The `project check` rows are subcommands of `node tools/src/cli.ts`. Read the project declaration for the exact command. A missing service or runtime is a validation limitation to report, not evidence that the project passed.

Use `changes --base <ref> --head <ref>` to select candidate projects for a cross-project change, then inspect shared interface effects. Git path selection cannot discover every runtime dependency.

Record commands, results, and material gaps in the current workflow's verification artifact. Never substitute migration or architecture checks for application tests.

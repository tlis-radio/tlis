# Shared libraries

Put reusable, independently versioned packages in `libraries/<name>/`. Applications stay under `projects/`; copy-free source ownership and explicit distributions let a library be reused without merging application build contexts or dependency installations.

The first package is [`stream-contracts`](stream-contracts/docs/README.md), consumed by the website and video service. Its canonical source owns lifecycle types; each application's versioned vendor archive keeps its Docker context independent. See its release workflow before changing exported contracts.

Every library owns `AGENTS.md`, `CLAUDE.md` importing that file, `CONTEXT.md`, API/architecture/configuration/development references, maintenance scripts, and local workflows. Each workflow and stage has context, a prompt, and a `tools/` capability directory (`.gitkeep` while empty).

Register libraries and their direct consumers through `_config/projects.json`. A library change must validate its public API, distribution, and all affected direct/transitive consumers. An application-only change stays scoped to that application and its declared consumers. Do not import another project's private source through relative paths; move a real shared contract here and declare the dependency explicitly.

```sh
npm run repo -- components list
npm run repo -- changes --base dev --head HEAD
npm run repo -- component check --component stream-contracts
npm run repo -- workflow init --workflow change --component stream-contracts --run contract-update
```

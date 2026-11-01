# Development and tests

Install Node 24.17+ in the Node 24 line and [Aspire CLI 13.6.0](https://aspire.dev/get-started/install-cli/). Follow Aspire's prerequisites for your OS; the CLI uses its .NET-based host and generates a TypeScript SDK. Enable a supported container runtime before opting into audio. Install FFmpeg and prepare a local Directus instance before opting into video.

Run from this project:

```sh
npm ci
cp .env.example .env
npm run restore
npm run check
npm run plan
npm run dev
```

Restoring generates `.aspire/modules/aspire.mts` and its runtime modules. These are machine-generated and ignored. A fresh checkout cannot typecheck `apphost.mts` until restore succeeds. Runtime modules need this project's `vscode-jsonrpc` dependency; do not replace the generated SDK with an untyped local imitation.

The default host starts the website and offline bot. Directus remains an external local reference and may be unhealthy until you start it. Use the dashboard and `http://localhost:3002/health` to inspect startup. The website can start without waiting for Directus, but CMS-backed pages still need it. With video enabled, video waits for Directus health and the website waits for video. Audio uses real container resources, so Docker must be available in the same environment as Aspire.

`npm run check` runs the real generated-SDK typecheck plus five offline topology tests. The recorder tests verify actual `configureResources` calls: independent npm contexts, disabled external bot connections, local Directus options, shared audio volumes/dependencies, distinct video ports, and redacted secret output. They do not launch a container or prove runtime readiness.

For a staged run, initialize `local-development` through the root repository CLI and follow its preparation, launch, and verification contracts. The stage's capability directory remains empty until a real external capability is assigned.

## Environment notes

The WSL environment used during implementation lacked ICU. Install the distribution's ICU runtime (Ubuntu 26.04 provides `libicu78`) before starting the full Aspire dashboard. Validation used an official Ubuntu package extracted into an isolated runtime directory, with `LD_LIBRARY_PATH` scoped to that process. Globalization-invariant mode can run some restore commands, but the dashboard needs named cultures; do not use invariant mode as a full-runtime workaround. `ASPIRE_CLI_PATH` can point to an isolated CLI installation. On Windows, use the Windows CLI, Node, Docker integration, and paths consistently; avoid mixing a Windows container client with a WSL host lacking Docker integration.

On an occupied port, stop the conflicting local process or deliberately update the centralized topology and tests. Do not start a second AppHost against the same ports. For a resource failure, inspect Aspire's resource logs, then the relevant project's local documentation; the devhost does not repair missing Directus schema or package/runtime dependencies.

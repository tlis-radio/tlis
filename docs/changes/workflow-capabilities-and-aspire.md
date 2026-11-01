# Workflow capabilities, libraries, and local orchestration

This change separates external agent capabilities from repository mechanics while keeping both available. `tools/` contains the MCP API bridge and provider/capability locations; existing deterministic maintenance code moves to `scripts/`. `npm run tool` remains an alias, and `npm run repo` is the canonical maintenance command.

Every agent workflow and numbered stage has context, a prompt, and scoped `tools/` entries. Forty-five workflow/stage locations have tracked `.gitkeep` capability placeholders while no provider is assigned. Run manifests expose those paths, the component reference index, and affected consumers. Component-local workflow definitions take precedence unless shared scope is selected explicitly.

`libraries/stream-contracts` extracts the website/video service's existing lifecycle and generic record types. Their private-key requirements and episode models remain local. Canonical source is built and packed into versioned, integrity-checked local archives, preserving each application's independent lockfile and Docker context. No existing dependency versions were upgraded.

`projects/tlis-devhost` adds an Aspire 13.6.0 TypeScript AppHost. It starts the website and an offline bot by default, with explicit audio/video profiles, separate local ports and volumes, and an external local Directus reference. Each of the six components now has architecture, API/service-contract, configuration, and development references.

## Validation evidence

- Root TypeScript check and **22 tests** passed, including a real in-memory MCP server/client exchange, capability allowlist rejection, schema validation, dependency impact, workflow scoping, and branch/path handling.
- Shared library build, **2 API/module-resolution tests**, canonical archive parity, and consumer lock integrity passed.
- Website and video production builds passed using the shared package, with no module-mode or existing dependency-version upgrades.
- Discord bot typecheck, **12 offline tests**, and production build passed after the script-path changes.
- Aspire restored and generated its real SDK; AppHost typecheck and **5 topology tests** passed.
- Live Aspire startup served the bot's `/health` and the website's `/api/album-art` without a title; both returned expected JSON. The host was stopped after the bounded test.
- All six manual GitHub workflow definitions passed actionlint. Architecture verification covered six components, eleven agent workflows, forty-five capability locations, canonical Claude/Codex adapters, and reference documents.
- Preserved history verification still passes for **563 source commits and 40 historical refs**. Immutable migration records were not changed.

The local WSL runtime initially lacked ICU; validation used an isolated official Ubuntu ICU package. Actual startup also verified npm's `--` forwarding for the website hostname argument. These prerequisites and startup contracts are documented with the devhost.

No real MCP provider, live calendar/Discord connection, production deployment, audio container run, or OBS/Directus video session was exercised. Audio/video runtime testing still needs Docker, FFmpeg, and a configured local Directus schema/token. Existing website/video npm audit findings remain outside this scoped change.

# Architecture

`apphost.mts` loads `DevHostOptions`, creates the generated Aspire builder, calls `configureResources`, and runs the distributed application. `src/topology.ts` owns validated options, reserved ports, and redacted plan output. `src/resources.ts` is the topology source of truth and uses real Aspire resource APIs.

The default resources are an external local Directus reference, a Next.js `cms-web` JavaScript app, and a `tlis-discord-bot` JavaScript app. Aspire runs each project's existing `dev` npm script in its own directory and performs its own `npm ci`; the website retains `--legacy-peer-deps`. The bot is forced offline for Discord/calendar use.

Enabling video adds a JavaScript app with separate HTTP and RTMP endpoints, a secret Directus token parameter, and a media directory under this host's ignored `.dev-data/`. Video waits for local Directus health; the website waits for video when it is enabled. Both receive the same `STREAMS_COLLECTION`, avoiding the source applications' different defaults.

Enabling audio adds two native Dockerfile resources (Icecast and Liquidsoap) plus Filebrowser. Liquidsoap reaches Icecast through its container network alias and waits for it. Filebrowser shares the fallback-music volume with Liquidsoap and waits for its startup. Named `tlis-dev-*` volumes isolate local media and Filebrowser state from existing production Compose volumes.

Aspire service references make dependencies visible; they do not rewrite application code to consume injected discovery variables. Directus URLs, public video URLs, and relevant port variables are injected explicitly. The website's existing audio player/metadata configuration remains application-owned; consult its configuration guide before assuming every audio request targets the local stack.

Directus itself, its schema/policies, FFmpeg, Docker, and external provider credentials are prerequisites, not provisioned infrastructure in this host. A typecheck or topology recorder test validates the model, not runtime availability. This project has no production publish configuration.

Primary references: [TypeScript AppHosts](https://aspire.dev/whats-new/aspire-13-4/), [adding Aspire to existing apps](https://aspire.dev/get-started/add-aspire-existing-app/), and [JavaScript hosting](https://aspire.dev/integrations/frameworks/javascript/).

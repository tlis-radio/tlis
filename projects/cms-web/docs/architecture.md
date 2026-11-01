# Website architecture

The website uses Next.js App Router. Localized public pages live under `src/app/[locale]/(page)`; dashboard pages and embed views are separate route groups below the same locale. `src/navigation.ts`, `src/i18n.ts`, and `src/middleware.ts` define locale routing. Middleware excludes the API paths and adds embedding headers for embed routes.

`src/services/cms-api-service.ts` owns server-side Directus reads. Its authenticated client requires `DIRECTUS_TOKEN` and `NEXT_PUBLIC_DIRECTUS_URL`; a separate public client reads public configuration without the static token. Models and DTOs convert Directus records into application data. Collections include Shows, Episodes, Members, Cast, Article, Article_Category, and the configured video stream collection.

Dashboard authentication is a browser-side Directus client in `src/context/DashboardAuthContext.tsx`. Its permissions remain Directus permissions; the Next.js UI is not a replacement authorization backend. Dashboard data operations live in `src/lib/dashboard/dashboard-service.ts`.

The audio player consumes Directus episode assets, live metadata from `/api/stream`, and heartbeat tracking routes. `src/lib/session.ts` resolves consented cookie IDs or daily anonymous identifiers; `src/lib/statistics.ts` writes listening metrics. View/share route deduplication and live-track history have process-local state, so they reset on restart and are not a distributed counter.

Video UI reads the configured Directus stream collection and uses `NEXT_PUBLIC_VIDEO_STREAM_BASE_URL` for playback. The website and video service currently have different default collection names; set `STREAMS_COLLECTION` consistently when integrating them. Public playback uses a stream ID rather than the OBS key.

The Docker image builds this project independently. Keep project-local dependency packaging intact when using a shared library, and validate the website together with every other registered consumer of a changed contract.

Shared stream lifecycle and generic record fields are owned by [stream-contracts](../../../libraries/stream-contracts/docs/README.md). See its [type API](../../../libraries/stream-contracts/docs/api.md) and [consumer release process](../../../libraries/stream-contracts/docs/release.md). Local DTOs retain private-key and episode-shape differences.

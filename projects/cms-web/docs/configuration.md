# Website configuration

| Variable | Used by |
| --- | --- |
| `NEXT_PUBLIC_DIRECTUS_URL` | Public Directus origin, server SDK clients, assets, dashboard |
| `DIRECTUS_TOKEN` | Server-side authenticated Directus client; keep private |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs and sitemap; source fallback is https://tlis.sk |
| `NEXT_PUBLIC_ANALYTICS_ID`, `NEXT_PUBLIC_ANALYTICS_URL` | Production browser analytics |
| `NEXT_PUBLIC_VIDEO_STREAM_BASE_URL` | Public live-video origin |
| `STREAMS_COLLECTION` | Video records; website default `video_streams` |
| `ICECAST_ENDPOINT` | Fallback JSON source-title lookup |
| `TRACKER_ENABLED` | Enables tracking only for the exact string `true` |
| `ANALYTICS_SALT_SECRET` | Stable secret for daily anonymous IDs across server instances |

Browser-visible `NEXT_PUBLIC_*` settings are public and used during Next.js compilation. Runtime-only changes do not reliably update an already built client bundle. `DIRECTUS_TOKEN` and the analytics salt must never be renamed with a public prefix.

The current Dockerfile exposes build arguments for Directus URL, analytics ID/URL, and site URL. A new public build setting needs corresponding Docker/workflow wiring; supplying an undeclared runtime value alone is not a complete image configuration change.

`next.config.mjs` restricts remote image hosts. Update that configuration when adding an asset origin. `.env.example` is the starting template; it is not an exhaustive list of every source variable.

For integrated video, select one real Directus collection name and set it in both this project and videostream. The code import does not create that collection or migrate its permissions. Development hosting and service selection are documented by the repository's `tlis-devhost` project.

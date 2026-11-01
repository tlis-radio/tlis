# Configuration

Copy `.env.example` to `.env` in this project. It is loaded only by the local CLI wrapper/plan scripts, is ignored by Git, and does not load the source streamserver's tracked environment files.

| Variable | Default | Meaning |
| --- | --- | --- |
| `TLIS_DIRECTUS_URL` | `http://localhost:8055` | Existing loopback HTTP(S) Directus, without URL credentials/query/fragment |
| `TLIS_ENABLE_AUDIO` | `false` | Add Icecast, Liquidsoap, and Filebrowser resources |
| `TLIS_ENABLE_VIDEO` | `false` | Add video service; requires a local Directus token |
| `TLIS_DIRECTUS_TOKEN` | Empty | Local video service access token; Aspire marks it secret |
| `TLIS_FFMPEG_PATH` | `ffmpeg` | Executable resolvable in the video process environment |
| `TLIS_STREAMS_COLLECTION` | `streams` | Same video collection injected into website and video service |
| `ASPIRE_CLI_PATH` | `aspire` | Optional absolute CLI executable path |

Flags accept `true` or `false`. The host rejects non-loopback Directus URLs rather than silently treating a production CMS as local development. Configure a local instance with compatible collections and policies.

Ports are centralized in `src/topology.ts` and intentionally distinct. Default direct npm processes bind to loopback. Audio ports follow the source container contracts; restrict container networking as needed for your local machine. The local audio credentials are explicit development values matching the current Liquidsoap script; they are not loaded from production configuration.

Bot credentials and `CALENDAR_ICS_URL` are overridden empty and `BOT_ENABLED=false`. Website analytics values are cleared. Editing this host to enable external integrations is a separate deliberate development choice; the default test topology does not connect them.

State uses ignored `.dev-data/video-media` and separate `tlis-dev-*` container volumes. Stopping the host does not imply deleting persistent volumes. Do not point these volumes at production data.

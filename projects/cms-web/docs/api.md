# Website API and data contracts

These are the route handlers under `src/app/api/`. They are relative to the website origin and are not locale-prefixed.

| Method and path | Request | Result |
| --- | --- | --- |
| `GET /api/session` | Optional `anonymous=true` query | `{sessionId,isNew,anonymous}`; sets a session cookie when new, or clears it in anonymous mode |
| `GET /api/stream` | No body | Current `artist`, `songTitle`, optional `idle`, and `history` metadata |
| `GET /api/album-art` | `title`, optional `artist` query | `{artworkUrl}`; null on no match, missing title, or lookup failure |
| `GET /api/show-by-episode/<id>` | Numeric episode ID in path | `{slug}`; 400 invalid ID, 404 no show, 500 lookup failure |
| `POST /api/heartbeat` | JSON `{episodeId:number,currentTime:number}` | `{ok:true,segment}`; playback position maps to 15-second segments |
| `POST /api/heartbeat/stream` | No caller identity required | `{ok:true}`; resolves current broadcast/episode and listening segment server-side |
| `POST /api/view/<id>` | Episode ID in path | `{success:true}`, or an already-counted message |
| `POST /api/share/<id>` | Episode ID in path | `{success:true}`, or an already-counted message |

Tracking POST routes return 403 unless `TRACKER_ENABLED=true`. Session identity for heartbeats is resolved server-side from request headers/cookies, not supplied in the JSON body. Malformed bodies or downstream failures can return 500; these handlers do not share a formal public API versioning layer.

`/api/stream` returns metadata, not an audio stream proxy. It prefers the current Directus title, then the configured Icecast JSON endpoint. Its five-item history is kept in the server process. Album art uses a Deezer search and a normalized title/artist match.

The service layer reads Directus content and builds public video entries containing status, linked episode, archive URL, and timestamps. The configured video collection must align with the video server; the website default is `video_streams` while that server's default is `streams`. Do not expose `stream_key` in public DTOs.

Dashboard authentication and write operations call Directus rather than additional Next.js route handlers. Preserve both the Directus collection schema and its access policies when changing dashboard behavior. Source contracts are in `src/types/`, `src/models/`, and `src/lib/dashboard/`.

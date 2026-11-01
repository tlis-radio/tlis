# Media and Directus contracts

| Interface | Path or behavior |
| --- | --- |
| RTMP ingest | `rtmp://<host>:<RTMP_PORT>/<STREAM_APP>`, with the private stream key as OBS key |
| Public live FLV | `<MEDIA_SERVER_PUBLIC_URL>/<STREAM_APP>/<stream_id>.flv` |
| Public archive | `<MEDIA_SERVER_PUBLIC_URL>/media/archive/<stream_id>.mp4` |
| Static media route | `/media`, rooted at `MEDIA_ROOT` by Node Media Server |

There is no custom health, calendar, or administrative REST endpoint in this project's source. A Compose port mapping alone does not establish an application API on that port.

`src/directus-client.ts` queries the configured collection using `stream_key == suppliedKey` and a non-null `episode`. It requests:

```text
id, stream_key, status, episode, archive_url, started_at, ended_at, last_error
```

The typed statuses are `scheduled | idle | live | ended | disabled`. `episode` can be a record, scalar ID, or null in the local type; authentication requires it to be non-null. The live transition sets `status=live`, a current `started_at`, and clears `ended_at`/`last_error`. Finalization sets `status=ended`, `ended_at`, and `archive_url`.

Do not use the private key in viewer-facing URLs or DTOs. Recorded source folders currently use the key internally, whereas archive filenames use the public stream ID. Protect stored media and avoid exposing broader raw recording paths when configuring a public reverse proxy.

The sample `viewer.html` is a separate browser example; it is not an application control API. Keep consumer behavior aligned with the actual media-server version and configured app/path.

Shared stream lifecycle and generic record fields are owned by [stream-contracts](../../../libraries/stream-contracts/docs/README.md). See its [type API](../../../libraries/stream-contracts/docs/api.md) and [consumer release process](../../../libraries/stream-contracts/docs/release.md). Local DTOs retain private-key and episode-shape differences.

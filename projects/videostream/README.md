# Videostream Server

## Project references

[Documentation index](docs/README.md) routes to architecture, API/service contracts, configuration, and development. Agent task routing is in [CONTEXT.md](CONTEXT.md); deterministic maintenance programs live in `scripts/`, while workflow/stage `tools/` directories describe external capabilities.

Minimal TypeScript streaming service with Directus auth.

## Scope

1. Stream ingest from OBS
2. Live output
3. Public archive by stream id (no key in archive URL)

## Ports

- `1935`: RTMP ingest
- `8000`: Live FLV + public archive files

## Environment

Copy `.env.example` to `.env`.

Required:

- `DIRECTUS_URL`
- `DIRECTUS_TOKEN`
- `MEDIA_SERVER_PUBLIC_URL`

Optional:

- `STREAMS_COLLECTION` default `streams`
- `STREAM_APP` default `live`
- `MEDIA_ROOT` default `./media`
- `RTMP_PORT` default `1935`
- `HTTP_MEDIA_PORT` default `8000`
- `FFMPEG_PATH` default `/usr/bin/ffmpeg`

## Directus stream model

Collection: `streams`

- `id` primary key
- `stream_key` unique key used by OBS
- `episode` relation to `Episodes.id` (required)
- `status` (`scheduled` | `idle` | `live` | `ended` | `disabled`)
- `archive_url` string nullable
- `started_at` datetime nullable
- `ended_at` datetime nullable

## Connection flow

1. OBS pushes `rtmp://<host>:1935/live` with `stream_key`.
2. Server validates key in Directus and checks `episode` is linked.
3. If valid, stream is marked `live`.
4. Server creates id-based live route for viewers.
5. On end, recorded FLV is finalized to MP4 and published by stream id.

## URLs

Live while stream is active:

- `http://localhost:8000/live/<stream_id>.flv`

Archive by stream id:

- `http://localhost:8000/media/archive/<stream_id>.mp4`

Viewer never needs the private OBS stream key.

## Commands

```bash
npm install
npm run build
docker compose up --build -d
```

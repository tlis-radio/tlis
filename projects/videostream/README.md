# Videostream Server (TypeScript + Directus + Node Media Server)

RTMP ingest service with stream-key authentication against Directus, automatic stream lifecycle updates, and Docker deployment.

## Features

- TypeScript implementation
- Node Media Server RTMP ingest
- Directus stream-key authentication on publish
- Required stream-to-episode linkage validation
- Stream status transitions (`idle/scheduled` -> `live` -> `ended`)
- Archive URL writeback to Directus when MP4 file is available
- Docker and docker-compose setup

## Environment

Copy `.env.example` to `.env` and fill values.

Required:

- `DIRECTUS_URL`: Directus base URL (example: `https://cms.example.com`)
- `DIRECTUS_TOKEN`: static token or service token with `streams` read/update permissions
- `MEDIA_SERVER_PUBLIC_URL`: public HTTP URL for media playback files (example: `https://stream.example.com:8000`)

Optional:

- `STREAMS_COLLECTION` (default: `streams`)
- `MEDIA_ROOT` (default: `./media`)
- `RTMP_PORT` (default: `1935`)
- `HTTP_MEDIA_PORT` (default: `8000`)
- `API_PORT` (default: `3001`)
- `FFMPEG_PATH` (default in Docker: `/usr/bin/ffmpeg`)
- `STREAM_APP` (default: `live`)

## Directus data model

See [docs/directus-streams-model.md](docs/directus-streams-model.md).

## Local development

```bash
npm install
npm run dev
```

## Build and run

```bash
npm run build
npm start
```

## Docker

```bash
docker compose up --build -d
```

Exposed ports:

- `1935` RTMP ingest
- `8000` media HTTP output
- `3001` health API (`GET /health`)

## OBS publish URL

Use this in OBS:

- Server: `rtmp://<host>:1935/live`
- Stream key: value from `streams.stream_key` in Directus

## Directus integration details

- On publish (`prePublish`):
  - validates stream key in Directus
  - requires stream row with non-null `episode`
  - rejects publish if not found or already live
  - updates stream `status=live` and `started_at`

- On stream end (`donePublish`):
  - sets `status=ended` and `ended_at`
  - attempts to locate newest MP4 archive under `MEDIA_ROOT/STREAM_APP/<streamKey>/`
  - writes `archive_url` when found

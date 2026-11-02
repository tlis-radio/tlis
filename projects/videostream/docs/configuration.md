# Video configuration

Required at process startup:

| Variable | Purpose |
| --- | --- |
| `DIRECTUS_URL` | Directus API origin |
| `DIRECTUS_TOKEN` | Server-side token for stream lookup/update |
| `MEDIA_SERVER_PUBLIC_URL` | Viewer-facing HTTP origin; used to store archive URLs |

Optional source defaults:

| Variable | Default |
| --- | --- |
| `STREAMS_COLLECTION` | `streams` |
| `MEDIA_ROOT` | `./media`, resolved from the working directory |
| `STREAM_APP` | `live` |
| `RTMP_PORT` | `1935` |
| `HTTP_MEDIA_PORT` | `8000` |
| `FFMPEG_PATH` | `/usr/bin/ffmpeg` |

The website defaults `STREAMS_COLLECTION` to `video_streams`, so explicitly choose a shared name for integrated deployments. Grant the token only the actual read/update access required by this service.

The Docker image installs FFmpeg and builds TypeScript. Compose loads `.env`, binds media storage at `./media:/app/media`, and publishes 1935, 8000, and 3001. The current source configures RTMP and HTTP media ports; it does not define a separate custom API on 3001.

`MEDIA_SERVER_PUBLIC_URL` should be reachable by browsers and match the public proxy origin, not necessarily the internal container address. Preserve media storage through deployment. Audio Icecast also defaults to host port 8000, so override host mappings when running both stacks. For a local video process, set a distinct `HTTP_MEDIA_PORT` and update `MEDIA_SERVER_PUBLIC_URL` to match.

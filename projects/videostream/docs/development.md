# Video development

From `projects/videostream`:

```sh
npm ci
cp .env.example .env
npm run build
```

Fill in development Directus credentials, collection, and public URL. For source-watch mode use `npm run dev`; `npm start` runs the compiled server. FFmpeg must be available at `FFMPEG_PATH` for relay and conversion. Docker can supply it through the included image:

```sh
docker compose config --quiet
docker compose up --build -d
```

From the root, `npm run repo -- project check --project videostream` runs the declared build check. The build cannot prove OBS ingest, Directus permissions, codec compatibility, relay availability, or archive conversion.

For an end-to-end development check, create a stream record linked to a development episode, ingest a short OBS stream with its private key, view the public ID-based FLV URL, stop ingest, then verify the MP4 archive and Directus ended state. Do not paste the private key into shared artifacts. Use disposable media or preserve existing recordings intentionally.

Use the project's local change/service workflow for scope and evidence. Changes to a shared stream contract require checks of the website and any other registered consumers. Production deployment remains a manual workflow on `main`; it does not run on a feature push.

Shared stream lifecycle and generic record fields are owned by [stream-contracts](../../../libraries/stream-contracts/docs/README.md). See its [type API](../../../libraries/stream-contracts/docs/api.md) and [consumer release process](../../../libraries/stream-contracts/docs/release.md). Local DTOs retain private-key and episode-shape differences.

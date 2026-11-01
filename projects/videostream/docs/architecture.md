# Video service architecture

`src/index.ts` loads configuration and starts `src/stream-server.ts`. Node Media Server owns RTMP ingest, HTTP FLV playback, recording, and static media serving. Directus is the metadata/authentication backend; FFmpeg performs live relaying and archive conversion.

On `prePublish`, the server requires the configured app name and looks up a stream key with a non-null linked episode in Directus. A match is marked live. The current lookup does not independently reject every value of the typed status union; read the actual Directus filter when changing authorization.

After publishing, `LiveRelayManager` copies the private-key input into an ID-based RTMP stream. Its in-memory relay map recognizes these internal streams so they bypass another key lookup. Public viewers use the ID-based FLV URL.

On `donePublish`, the server stops the public relay, selects candidate FLV recordings under `MEDIA_ROOT/<app>/<key>`, and finalizes an archive named by stream ID. Conversion first tries codec copy, then H.264/AAC transcoding. The Directus record is marked ended with the archive URL, or null when no usable archive was found.

Media files must persist outside container replacement. Relay processes and finalization guards are process-local; the implementation is a single-instance starter, not a distributed recording coordinator.

The website consumes stream records and public URLs. Its default collection name differs from this service's; configure both to use the same real Directus collection. Shared contract changes must be validated against all registered direct consumers.

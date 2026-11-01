# Video streaming and archive

The root `AGENTS.md` applies. This project owns its TypeScript, FFmpeg, and Node Media Server implementation, local context, prompts, service workflow, and deterministic checks.

Install dependencies here with `npm ci`; the declared project check runs `npm run build`. Runtime checks need FFmpeg and configured Directus access. A successful TypeScript build does not exercise OBS ingest, recording, or archive finalization.

Public live and archive URLs use the stream ID. Never expose the private OBS stream key in URLs, logs, artifacts, or responses. Preserve the Directus stream-to-episode relationship and recorded-media paths when changing ingest or finalization.

Use the video production workflow on main, preserving the video-stream image name and existing GET deployment method. Keep media volumes across checkout changes. RTMP uses 1935 and public media defaults to host port 8000, which can collide with Icecast.

Use `CONTEXT.md` to route changes. Shared code-change stages live at `../../workflows/change/`; service-specific operations live at `workflows/service/`. Add repeatable project mechanics under `tools/` and declare checks in `_config/project.json`.

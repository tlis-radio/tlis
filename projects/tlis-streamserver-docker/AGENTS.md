# Audio streaming stack

The root `AGENTS.md` applies. This project owns its Docker Compose, Icecast, and Liquidsoap implementation, local context, prompts, service workflow, and deterministic checks.

The declared project check runs `docker compose config --quiet` from this folder. It validates configuration without starting containers or printing expanded secret values. A real audio-path test requires Docker, audio files, and the intended stream environment.

Preserve fallback music/jingle directory structure and shared volume semantics. Scheduling uses ISO-like local date-time strings such as `2026-07-08T10:30`; verify the intended timezone when changing scheduling. The imported `.env` and `auth.env` were tracked in source history, so ignoring them does not remove that history.

This project had no original GitHub deployment workflow. Follow the deployment host's Compose process when an operation is requested. Preserve its Compose project name and named volumes. Icecast defaults to host port 8000 and Filebrowser to 8080; avoid collision with video.

Use `CONTEXT.md` to route changes. Shared code-change stages live at `../../workflows/change/`; service-specific operations live at `workflows/service/`. Add repeatable project mechanics under `tools/` and declare checks in `_config/project.json`.

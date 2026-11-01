# Website and dashboard

The root `AGENTS.md` applies. This project owns its Next.js implementation, local context, prompts, service workflow, and deterministic checks.

Install dependencies here with `npm ci --legacy-peer-deps`. The declared project check runs TypeScript checking. `npm run build` is the full build and may require development service settings. The imported `lint` script uses `next lint`; verify it against the installed Next.js version before claiming lint coverage.

Keep locale routing, public website behavior, and dashboard authentication distinct. Preserve Directus and analytics build-argument names when changing the Dockerfile. Build with this project folder as the context.

Use the website development workflow on dev, or production workflow on main. Preserve the tlis-web-dev / tlis-web image names and environment-specific deployment IDs. Discord build notifications are an optional manual input.

Use `CONTEXT.md` to route changes. Shared code-change stages live at `../../workflows/change/`; service-specific operations live at `workflows/service/`. Add repeatable project mechanics under `tools/` and declare checks in `_config/project.json`.

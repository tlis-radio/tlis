# TLIS Aspire devhost

A TypeScript Aspire 13.6.0 AppHost for local development. Aspire owns resource lifecycles, startup relationships, endpoints, logs, and its development dashboard. The services keep their own code and dependencies.

```sh
cd projects/tlis-devhost
npm ci
cp .env.example .env
npm run restore
npm run check
npm run plan
npm run dev
```

Install the Aspire 13.6.0 CLI and Node 24 first. Audio additionally needs a working container runtime; video needs a local Directus schema/token and FFmpeg. Directus is an external local service at `http://localhost:8055` by default. The host does not create its collections, policies, or users.

The default topology starts the website on port `3000` and the bot's local HTTP server on `3002`. Discord login, command registration, calendar access, and website analytics are disabled by the AppHost. Set `TLIS_ENABLE_AUDIO=true` and/or `TLIS_ENABLE_VIDEO=true` in this project's `.env` for those local resources. Audio uses `8000`; video uses `8001` so their HTTP ports do not collide.

Use the Aspire dashboard URL printed by the CLI (configured HTTP dashboard port `15888`) to inspect resources. Stop with Ctrl+C or `npm run stop`. `npm run plan` prints a redacted topology and does not launch resources.

See the [reference index](docs/README.md), [configuration](docs/configuration.md), and [development/test guide](docs/development.md). This host is for dev time; production deployment remains in the separate manual GitHub workflows.

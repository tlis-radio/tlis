# Aspire development host

This project owns local development orchestration, not production deployment. Read `CONTEXT.md` and the relevant local workflow stage. Its public contract is the Aspire topology and environment options documented in `docs/`.

- `apphost.mts` composes resources through the generated Aspire 13.6.0 TypeScript SDK. Restore the SDK before typechecking; do not commit `.aspire/`.
- Keep each application's own package installation, working directory, environment, and Docker context. Changes to resource options must preserve unrelated applications.
- Default resources are the website and a Discord-disabled bot. Audio and video are explicit opt-ins. Directus is an existing loopback development service; this host does not provision its schema or users.
- Use only local development credentials. Bot/calendar connections and website analytics are disabled by this topology. Keep video tokens out of plans and logs.
- Run `npm run restore`, then `npm run check`. Topology tests do not prove that Docker, FFmpeg, Directus, or application services are running. Record any runtime prerequisites that prevent a live check.
- Use harness tools and existing scripts, including the Aspire CLI wrappers. Workflow `tools/` folders are optional locations for real helpers, with `.gitkeep` until one is needed.

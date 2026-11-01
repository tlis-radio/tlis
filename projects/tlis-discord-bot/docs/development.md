# Bot development

Use Node 24.17 or later within the Node 24 line. From this project:

```sh
npm ci
cp .env.example .env
npm run check
npm run dev
```

The example environment leaves Discord disabled and does not require a live calendar. Check `http://127.0.0.1:3002/health`. The declared root dispatcher is:

```sh
npm run repo -- project check --project tlis-discord-bot
```

The project check runs type checking, tests with injected/fake services, and the production build. No Discord registration or live message is needed for those checks.

To add a slice, follow `workflows/add-feature/CONTEXT.md`, create a feature folder with its request/validation/handler/registration, and map it at `src/app.ts`. Introduce a typed port for a genuinely external dependency, place provider mechanics in an adapter, and test the slice without that provider.

Preview slash-command definitions with `npm run commands`. When the task explicitly includes registration, use `npm run commands -- --apply` after configuring the development application/guild/token. Then enable the gateway. Applying replaces the application's command set for that guild, so use a separate development application from production.

Container checks use `docker compose config --quiet`; launching the stack is a separate operation. The local devhost also supports the disabled-gateway HTTP process for development.

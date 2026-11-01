# TLIS Discord bot

TypeScript vertical slices with a Minimal API-style composition root. Node 24 is the runtime. Keep this package and its lockfile independent from other projects.

- `src/app.ts` registers features. A slice owns its request validation, handler, and mapping beside each other in `src/features/<feature>/`.
- `src/shared/` contains the small HTTP and command routing primitives, not a generic application framework.
- `src/integrations/` holds external adapters. Keep Discord SDK objects out of feature handlers; inject ports such as `CalendarService` so tests remain offline.
- `workflows/add-feature/CONTEXT.md` routes substantial feature or integration work. For a small correction, read only the relevant slice and tests.
- Run `npm ci` once, then `npm run check` or `node scripts/check.ts`. The check covers typechecking, offline tests, and a production build.

Discord is disabled by default. Normal startup must never register commands. `npm run commands` prints a preview; the explicit `--apply` variant replaces commands only in the configured guild. Tests use fakes and must not register commands, send messages, or access a live calendar.

Calendar feed URLs can contain access tokens. Do not log them or upstream error objects. Keep calendar replies ephemeral, suppress mentions from external content, exclude private/confidential/cancelled events, and preserve the feed's all-day date semantics. Add an adapter for OAuth calendar APIs rather than embedding provider SDK calls inside a slice.

Use `docs/README.md` for architecture, API/service-contract, configuration, and development references. The AI follows workflow stage `CONTEXT.md` instructions using harness tools and existing scripts; the user writes ordinary requests in chat.

---
name: bot-feature
description: Add or change a TLIS Discord command, HTTP slice, or external-service adapter in the TLIS bot project.
---

Start from the requested behavior, the project guide/context, and the affected slice/adapter's current contract. Resolve missing command semantics or provider assumptions before coding against them. Use [the project feature workflow](../../../workflows/add-feature/CONTEXT.md) for substantial work; load only the selected stage's inputs. Small fixes need no stage scaffold.

For a saved run maintain the task record beside its manifest, linking stage `output/<run-id>/` evidence. Record acceptance, authoritative input versions, current state, blockers, and next action. Source changes remain in their normal project paths.

Keep request validation, handler, and registration in one feature folder. Put Discord and calendar provider transport behind an adapter interface. `src/app.ts` is the composition root; inject services into handlers rather than accessing a provider SDK directly.

Run `node scripts/check.ts` from `projects/tlis-discord-bot`. When command definitions change, inspect `npm run commands`, which previews the manifest. Verify acceptance with offline slice/adapter tests and record actual results. Produce the source/test diff, configuration requirements, and verification evidence. Finish after requested acceptance, reporting live checks still unperformed. Live registration/messages/calendar writes follow current task authorization and are outside offline verification; ask only if that authorization or a material decision is missing.

---
name: bot-feature
description: Add or change a TLIS Discord command, HTTP slice, or external-service adapter in the TLIS bot project.
---

Use [the project feature workflow](../../../workflows/add-feature/CONTEXT.md) for substantial work. Load the current stage's listed inputs; keep per-task artifacts under that stage's `output/<run-id>/` folder.

Keep request validation, handler, and registration in one feature folder. Put Discord and calendar provider transport behind an adapter interface. `src/app.ts` is the composition root; inject services into handlers rather than accessing a provider SDK directly.

Run `node tools/check.ts` from `projects/tlis-discord-bot`. When command definitions change, inspect `npm run commands`, which previews the manifest. Live command registration, Discord messages, and calendar writes are separate external actions and are not part of offline verification.

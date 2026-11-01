# Prepare local development

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | projects/tlis-devhost/AGENTS.md and CONTEXT.md | Applicable host rules |
| Stable | projects/tlis-devhost/docs/architecture.md and docs/api.md | Selected resource relationships/contracts |
| Stable | projects/tlis-devhost/docs/configuration.md and docs/development.md | Profile prerequisites |
| Working | Current user request and selected audio/video profile | This run only |

## Tools

Use harness file/search/edit tools and Git, plus this project's `npm run restore`, `npm run plan`, `npm run check`, and `npm run dev` commands. Use the Aspire dashboard, scoped resource logs, and local HTTP health checks to verify running services.

## Process

Read docs/configuration.md and docs/development.md. Check Node/Aspire versions and restore the generated SDK. Validate local Directus/token/FFmpeg/Docker prerequisites only for enabled resources. Run npm run plan and npm run check. Record unavailable prerequisites before launch; do not claim runtime validation from topology tests.

## Outputs

Write output/<run-id>/preparation.md relative to this stage. Keep it readable and free of credentials.

## Verify

Report exact commands, observed evidence, and unperformed checks. Do not infer live service health from a model/SDK typecheck.

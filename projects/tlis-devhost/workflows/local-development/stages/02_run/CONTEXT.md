# Run local development

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | projects/tlis-devhost/AGENTS.md and CONTEXT.md | Applicable host rules |
| Stable | projects/tlis-devhost/docs/architecture.md and docs/api.md | Selected resource relationships/contracts |
| Stable | projects/tlis-devhost/docs/configuration.md and docs/development.md | Profile prerequisites |
| Working | ../01_prepare/output/<run-id>/preparation.md | This run only |

## Tools

Use harness file/search/edit tools and Git, plus this project's `npm run restore`, `npm run plan`, `npm run check`, and `npm run dev` commands. Use the Aspire dashboard, scoped resource logs, and local HTTP health checks to verify running services.

## Process

Run npm run dev for the selected local profile when the task authorizes local startup. Inspect the CLI/dashboard resource state. Keep bot/calendar connections disabled by default and do not use production credentials. Record resource names/endpoints and how this run will be stopped, without logging authentication tokens.

## Outputs

Write output/<run-id>/run.md relative to this stage. Keep it readable and free of credentials.

## Verify

Report exact commands, observed evidence, and unperformed checks. Do not infer live service health from a model/SDK typecheck.

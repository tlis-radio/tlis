# Run local development

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | projects/tlis-devhost/AGENTS.md and CONTEXT.md | Applicable host rules |
| Stable | projects/tlis-devhost/docs/architecture.md and docs/api.md | Selected resource relationships/contracts |
| Stable | projects/tlis-devhost/docs/configuration.md and docs/development.md | Profile prerequisites |
| Working | ../01_prepare/output/<run-id>/preparation.md | This run only |

## Tools

Read this stage's tools/ and the workflow's tools/ entries. Empty .gitkeep placeholders assign no external capabilities. Use scripts/ for declared local Aspire/npm mechanics; permissions still come from the current task.

## Process

Run npm run dev for the selected local profile when the task authorizes local startup. Inspect the CLI/dashboard resource state. Keep bot/calendar connections disabled by default and do not use production credentials. Record resource names/endpoints and how this run will be stopped, without logging authentication tokens.

## Outputs

Write output/<run-id>/run.md relative to this stage. Keep it readable and free of credentials.

## Verify

Report exact commands, observed evidence, and unperformed checks. Do not infer live service health from a model/SDK typecheck.

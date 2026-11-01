# Verify local development

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | projects/tlis-devhost/AGENTS.md and CONTEXT.md | Applicable host rules |
| Stable | projects/tlis-devhost/docs/architecture.md and docs/api.md | Selected resource relationships/contracts |
| Stable | projects/tlis-devhost/docs/configuration.md and docs/development.md | Profile prerequisites |
| Working | ../02_run/output/<run-id>/run.md | This run only |

## Tools

Read this stage's tools/ and the workflow's tools/ entries. Empty .gitkeep placeholders assign no external capabilities. Use scripts/ for declared local Aspire/npm mechanics; permissions still come from the current task.

## Process

Verify local bot /health and selected application interfaces against each component's docs. Distinguish running, healthy, and untested resources. Check the relevant consumers if a shared contract changed. Stop the host when the bounded test run is complete unless continued operation is requested. Record actual results and remaining configuration.

## Outputs

Write output/<run-id>/verification.md relative to this stage. Keep it readable and free of credentials.

## Verify

Report exact commands, observed evidence, and unperformed checks. Do not infer live service health from a model/SDK typecheck.

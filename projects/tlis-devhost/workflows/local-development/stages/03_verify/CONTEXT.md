# Verify local development

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | projects/tlis-devhost/AGENTS.md and CONTEXT.md | Applicable host rules |
| Stable | projects/tlis-devhost/docs/architecture.md and docs/api.md | Selected resource relationships/contracts |
| Stable | projects/tlis-devhost/docs/configuration.md and docs/development.md | Profile prerequisites |
| Working | ../02_run/output/<run-id>/run.md | This run only |

## Tools

Use harness file/search/edit tools and Git, plus this project's `npm run restore`, `npm run plan`, `npm run check`, and `npm run dev` commands. Use the Aspire dashboard, scoped resource logs, and local HTTP health checks to verify running services.

## Process

Verify local bot /health and selected application interfaces against each component's docs. Distinguish running, healthy, and untested resources. Check the relevant consumers if a shared contract changed. Stop the host when the bounded test run is complete unless continued operation is requested. Record actual results and remaining configuration.

## Outputs

Write output/<run-id>/verification.md relative to this stage. Keep it readable and free of credentials.

## Verify

Report exact commands, observed evidence, and unperformed checks. Do not infer live service health from a model/SDK typecheck.

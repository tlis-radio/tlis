# tlis-streamserver-docker: verify

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| Stable | `projects/tlis-streamserver-docker/AGENTS.md`, `projects/tlis-streamserver-docker/CONTEXT.md` | Applicable project constraints |
| Stable | `projects/tlis-streamserver-docker/docs/` | Relevant architecture/API/configuration/development sections |
| Stable | `_config/projects.json`, component check declaration | Registered dependencies and consumers |
| Working | `projects/tlis-streamserver-docker/workflows/change/stages/02_implement/output/<run-id>/change.md` | Current run only |

## Tools

Use harness file/search/edit tools and Git. Run `node scripts/check.ts` or `docker compose config --quiet` from this project. Use Compose status and scoped logs for local service checks without printing resolved credentials.

## Process

Use docker compose config --quiet through the declared project check. Exercise Liquidsoap syntax/runtime and real audio transitions only in the requested development environment; config validation alone does not prove them. Recheck acceptance criteria against the actual diff. If a shared library changed, verify that library and all declared direct consumers, not only this project.

## Outputs

Write `output/<run-id>/verification.md` relative to this stage. Preserve saved human edits and keep secrets out of evidence.

## Verify

Record commands, outcomes, acceptance coverage, direct-consumer compatibility checks where applicable, and unavailable runtime services.

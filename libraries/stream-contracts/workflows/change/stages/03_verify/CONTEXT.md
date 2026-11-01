# Verify compatibility

Input paths are repository-relative unless marked as a preceding stage artifact.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| `Working` | `../01_contract/output/<run-id>/contract.md; ../02_implement/output/<run-id>/implementation.md` | `Expected behavior and changes` |
| `Stable` | `libraries/stream-contracts/scripts/check.ts; libraries/stream-contracts/docs/development.md` | `Deterministic checks and their limits` |

## Process

Run typechecks, build, and compatibility tests. If canonical package contents changed, a stale-distribution failure is expected until the release workflow synchronizes a version. Record the release decision and actual results; do not claim application runtime coverage from type checks.

## Outputs

Write `output/<run-id>/verification.md` with decisions, changed files, actual check evidence, and remaining work relevant to this stage. Use the latest saved artifact, including human edits. Do not include credentials or unrelated context.

## Verify

Check the result against the accepted input contract and distinguish observed results from assumptions. The next stage consumes this run's saved handoff.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

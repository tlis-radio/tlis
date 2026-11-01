# Implement canonical source

Input paths are repository-relative unless marked as a preceding stage artifact.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| `Working` | `../01_contract/output/<run-id>/contract.md` | `Accepted API and consumer boundary` |
| `Stable` | `libraries/stream-contracts/src/index.ts` | `Canonical exports` |
| `Stable` | `libraries/stream-contracts/tests/compatibility.test.mjs` | `Both consumer compiler modes` |

## Process

Change source and compatibility tests together. Preserve local DTO exports and optional/required private-key differences. Do not edit generated dist or vendor archives by hand.

## Outputs

Write `output/<run-id>/implementation.md` with decisions, changed files, actual check evidence, and remaining work relevant to this stage. Use the latest saved artifact, including human edits. Do not include credentials or unrelated context.

## Verify

Check the result against the accepted input contract and distinguish observed results from assumptions. The next stage consumes this run's saved handoff.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

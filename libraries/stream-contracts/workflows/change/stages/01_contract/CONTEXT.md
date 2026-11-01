# Define the contract

Input paths are repository-relative unless marked as a preceding stage artifact.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| `Stable` | `libraries/stream-contracts/docs/api.md` | `Current shared field and status semantics` |
| `Stable` | `projects/cms-web/src/types/stream.ts; projects/videostream/src/types.ts` | `Actual consumers and their private/episode differences` |
| `Working` | `Current request and accepted behavior examples` | `Current change only` |

## Process

Identify the API change, affected consumers, compatibility expectations, and version impact. Keep provider/episode-specific fields local. Record decisions requiring a reviewer rather than changing them implicitly.

## Outputs

Write `output/<run-id>/contract.md` with decisions, changed files, actual check evidence, and remaining work relevant to this stage. Use the latest saved artifact, including human edits. Do not include credentials or unrelated context.

## Verify

Check the result against the accepted input contract and distinguish observed results from assumptions. The next stage consumes this run's saved handoff.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

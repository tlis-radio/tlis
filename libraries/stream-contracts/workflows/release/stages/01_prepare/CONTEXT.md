# Prepare the version

Input paths are repository-relative unless marked as a preceding stage artifact.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| `Working` | `Accepted change-workflow verification and current user task` | `Scope authorized for this local release` |
| `Stable` | `libraries/stream-contracts/docs/release.md; libraries/stream-contracts/package.json` | `Versioned distribution procedure` |
| `Stable` | `libraries/stream-contracts/_config/consumers.json` | `Actual affected consumers` |

## Process

Review API compatibility and choose the intended version. Update library package metadata and lock together without creating a tag or publishing. Record consumer validation commands and missing runtime prerequisites.

## Outputs

Write `output/<run-id>/release-plan.md` with decisions, changed files, actual check evidence, and remaining work relevant to this stage. Use the latest saved artifact, including human edits. Do not include credentials or unrelated context.

## Verify

Check the result against the accepted input contract and distinguish observed results from assumptions. The next stage consumes this run's saved handoff.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

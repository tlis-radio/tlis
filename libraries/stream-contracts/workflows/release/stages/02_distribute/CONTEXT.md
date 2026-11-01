# Distribute and verify

Input paths are repository-relative unless marked as a preceding stage artifact.

## Inputs

| Kind | Input | Scope |
| --- | --- | --- |
| `Working` | `../01_prepare/output/<run-id>/release-plan.md` | `Accepted version and validation scope` |
| `Stable` | `libraries/stream-contracts/scripts/sync-consumers.ts; libraries/stream-contracts/docs/release.md` | `Packing, synchronization, and parity mechanics` |
| `Stable` | `projects/cms-web/Dockerfile; projects/videostream/Dockerfile` | `Independent project build contexts` |

## Process

Run npm run vendor:sync from the library, then npm run check. Install and check both consumers using their own lockfiles and existing install flags. Confirm the same archive bytes, versioned file dependencies, and lock integrity. Record checks requiring unavailable service configuration separately.

## Outputs

Write `output/<run-id>/release-evidence.md` with decisions, changed files, actual check evidence, and remaining work relevant to this stage. Use the latest saved artifact, including human edits. Do not include credentials or unrelated context.

## Verify

Check the result against the accepted input contract and distinguish observed results from assumptions. The next stage consumes this run's saved handoff.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

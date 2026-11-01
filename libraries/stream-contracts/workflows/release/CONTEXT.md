# Release a local stream-contract distribution

Use after an accepted source or packaged-documentation change. Paths in stage input tables are repository-relative; outputs are relative to the stage.

| Order | Stage | Handoff |
| --- | --- | --- |
| 1 | `stages/01_prepare/CONTEXT.md` | Version and compatibility scope |
| 2 | `stages/02_distribute/CONTEXT.md` | Matching local archives, locks, and consumer evidence |

A local release updates the two versioned project distributions. It does not publish to a registry or deploy a service. Use one run ID and the latest reviewed artifacts. See `docs/release.md` for exact commands and source-of-truth rules.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

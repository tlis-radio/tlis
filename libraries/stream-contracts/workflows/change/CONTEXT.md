# Change the shared stream contract

Use this workflow for an exported lifecycle or record-shape change. Paths in stage input tables are repository-relative; outputs are relative to the stage.

| Order | Stage | Handoff |
| --- | --- | --- |
| 1 | `stages/01_contract/CONTEXT.md` | Accepted API and consumer impact |
| 2 | `stages/02_implement/CONTEXT.md` | Canonical source and compatibility tests |
| 3 | `stages/03_verify/CONTEXT.md` | Validation evidence and release decision |

Load only the current stage's references and working inputs. Use a unique run ID and inspect saved output before the next stage. Existing task authorization can cover consecutive stages; unresolved API decisions need a concrete decision rather than an invented default. Distribution is handled by the local release workflow.

## Tools

Read this scope's tools/ and, for a stage, its parent workflow's tools/. A .gitkeep placeholder means no external/MCP capability is assigned. Import only explicitly assigned TypeScript capability APIs; use scripts/ for maintenance mechanics. Tool availability does not replace task authorization.

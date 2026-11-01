# Add a bot slice or integration

Use this workflow for a new Discord command, HTTP endpoint, or external adapter. Small fixes can go directly to the affected slice and its tests.

| Order | Stage | Handoff |
| --- | --- | --- |
| 1 | `stages/01_contract/CONTEXT.md` | Request/response contract and integration boundary |
| 2 | `stages/02_slice/CONTEXT.md` | Implemented slice and adapter with offline tests |
| 3 | `stages/03_verify/CONTEXT.md` | Check results and deployment requirements |

Choose one task run ID and write human-readable artifacts under each stage's `output/<run-id>/`. A reviewer can inspect or edit an artifact before the next stage consumes it. Carry forward existing user decisions; pause only when the next stage needs a missing decision or authorization for an external action. Live Discord/calendar operations are outside the offline validation workflow.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

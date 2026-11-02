# Add a bot slice or integration

Use this workflow for a new Discord command, HTTP endpoint, or external adapter. Small fixes can go directly to the affected slice and its tests.

| Order | Stage | Handoff |
| --- | --- | --- |
| 1 | `stages/01_contract/CONTEXT.md` | Request/response contract and integration boundary |
| 2 | `stages/02_slice/CONTEXT.md` | Implemented slice and adapter with offline tests |
| 3 | `stages/03_verify/CONTEXT.md` | Check results and deployment requirements |

Choose one task run ID and write human-readable artifacts under each stage's `output/<run-id>/`. A reviewer can inspect or edit an artifact before the next stage consumes it. Carry forward existing user decisions; pause only when the next stage needs a missing decision or authorization for an external action. Live Discord/calendar operations are outside the offline validation workflow.

## Tools

Use harness file/search/edit tools and Git. Run `npm run check` from this project. Use command preview for changed command definitions and offline adapter tests for integrations; live Discord/calendar calls follow the current task authorization. The workflow's `tools/` is an optional location for real helper files; `.gitkeep` means no local helper is shipped.

## Task state and transition

Follow the [shared saved-state and transition convention](../../../../docs/ai-workspace.md#save-and-resume). This workflow's stage Verify sections supply its specific acceptance criteria for advancing.

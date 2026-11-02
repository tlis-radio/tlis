# Shared change workflow

The human describes the desired outcome in chat. The AI uses these stages when they help; small edits can go straight to implementation and verification.

| Stage | Job | Handoff |
| --- | --- | --- |
| `01_scope` | Understand behavior and acceptance criteria | `scope.md` |
| `02_plan` | Choose implementation and checks | `plan.md` |
| `03_implement` | Make the change | `change.md` |
| `04_verify` | Validate behavior | `verification.md` |
| `05_release` | Prepare PR or requested release | `release.md` |

Read the selected stage's CONTEXT.md and relevant inputs. No separate prompt template is required. The AI may initialize output folders when durable handoffs help; the user does not need to supply a run ID.

Each stage writes to its own `output/<run-id>/`. Use saved human edits. If delegating a real subtask, write a scoped prompt for it instead of copying a generic root prompt.

For a saved run maintain one `output/<run-id>/task.md` beside `run.json`: current goal/recipient, acceptance, input versions, stage/status, evidence, blockers, next action, and any approval's exact version. This is state/data. Stage contexts are method; source and reference docs remain authoritative facts. See [resume conventions](../../docs/ai-workspace.md#save-and-resume).

Advance after the current stage's verification criterion is met. Continue authorized reversible work automatically. Pause only for a missing material decision or authorization. Completed source/deliverables stay in their normal paths; link acceptance evidence from the task record before marking it done. PR preparation does not imply deployment.

## Tools

Use harness file/search/terminal tools and configured MCP connections where relevant. Existing scripts handle Git queries, checks, and output folders. `tools/` is an empty location for a future workflow helper, not a provider framework.

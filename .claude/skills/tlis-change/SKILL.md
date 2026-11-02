---
name: tlis-change
description: Implement TLIS features, fixes, repository scripts, or reference documentation changes using the affected scope and acceptance checks.
---

Use the user's ordinary request, the affected source, and its authoritative configuration/reference material. Identify observable acceptance criteria and affected consumers; ask only when a missing decision materially changes the result. Explicitly read local project guidance when starting above that project.

1. Select a component-local workflow when it covers the change; use the [shared workflow](../../../workflows/change/CONTEXT.md) for cross-project or repository work. Read only the selected stage and its required inputs. Small edits need no run scaffold.
2. For substantial work, keep one task record beside the run manifest using [saved-state conventions](../../../docs/ai-workspace.md#save-and-resume). Record input versions, current stage, decisions, checks, and next action; resume from saved human edits.
3. Implement in existing source paths. Preserve independent builds/locks and check real producers/consumers when interfaces change. Keep small types local; extract a library for a concrete reuse benefit.
4. Run checks tied to acceptance and review the actual diff. Report failures, missing services, and unperformed runtime checks accurately. A structural check does not establish application behavior.
5. Link finished source/deliverables and validation evidence from the task record or reviewer-facing result. Mark completion only after acceptance; record any real review/approval with its artifact version.

Stage CONTEXT.md files instruct the AI. Use harness tools, configured MCP connections, and existing scripts. Do not add a generic MCP client or another agent framework.

If delegation helps, write a bounded prompt with inputs, scope, expected output, and an integration check. Use distinct run paths and isolated branches/worktrees when edits overlap. Continue authorized reversible work; stop only for a material missing decision or authorization, preserving a concrete next action.

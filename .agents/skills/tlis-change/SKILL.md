---
name: tlis-change
description: Implement TLIS changes using relevant project context and real verification.
---

Start with the user's normal request. Read the relevant project instructions and reference docs. Use local workflow stages when useful, or the [shared workflow](../../../workflows/change/CONTEXT.md) for cross-project work. Do not require prompt templates or stage selection from the user.

Stage CONTEXT.md files instruct the AI. Use harness tools, configured MCP connections, and existing scripts. Do not add a generic MCP client or another agent framework.

If delegation helps, write a specific subtask prompt from the current scope, inputs, constraints, and expected result. Save it with run artifacts only when useful. Small changes need no run scaffold.

Preserve independent builds and locks. Keep small types local; extract a library only for a real reuse benefit. Validate affected behavior and consumers, then record actual results and missing services.

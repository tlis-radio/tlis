---
name: tlis-change
description: Plan and implement TLIS component changes with scoped workflow context and consumer compatibility checks.
---

Discover the target project or library through `_config/projects.json`, then read its `AGENTS.md` and `CONTEXT.md`. Use a component-local workflow when it fits; use the [shared change workflow](../../../workflows/change/CONTEXT.md) for cross-component scope, implementation choices, and evidence.

Initialize a shared run with `npm run repo -- workflow init --workflow change --scope shared --component <name> --run <slug>`. Component-local definitions are selected by default when present. Load only the relevant stages and declared inputs.

Each workflow and stage has a context, prompt, and `tools/` capability directory. Read the local definitions for external/MCP operations; `.gitkeep` means none are declared. A definition does not install a provider, supply credentials, or authorize an operation. Deterministic mechanics remain TypeScript programs in `scripts/`.

Keep working handoffs in `output/<run-id>/`, separate from stable references. Use saved human edits and the run's agreed review points. Small changes can skip stages that add no useful information.

When changing a shared library, check its package and every registered direct consumer. Preserve independently installable lockfiles and Docker contexts. Use [validation guidance](../../../shared/references/validation.md), record actual results and missing services, and avoid treating architecture/history checks as runtime validation.

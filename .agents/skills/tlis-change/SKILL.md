---
name: tlis-change
description: Plan and implement TLIS code changes using the shared staged workflow and the affected project's context.
---

Use the repository's [change workflow](../../../workflows/change/CONTEXT.md) for changes that need scoped acceptance criteria, implementation choices, and verification evidence.

Read the target project's `AGENTS.md` and `CONTEXT.md`. Select the relevant stages; do not preload every stage or project. For a substantial change, initialize a unique run with `node tools/src/cli.ts workflow init --workflow change --project <name> --run <slug>`.

Keep stage-specific working artifacts under `output/<run-id>/`, separate from stable references. Downstream work reads the current saved handoff, including human edits. Use existing task authorization and agreed review points; small changes may skip stages that add no useful information.

Use the declared TypeScript tools for mechanical operations and the affected project's actual checks for behavior. Read [validation guidance](../../../shared/references/validation.md) when selecting checks. Record actual results and missing services without treating an architecture or history pass as runtime validation.

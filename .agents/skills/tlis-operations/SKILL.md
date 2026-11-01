---
name: tlis-operations
description: Validate or operate TLIS services through their scoped capability definitions, scripts, and manual deployment workflows.
---

Identify the requested component and operation. Read its `CONTEXT.md`, relevant docs, and named local operation workflow. Load the current workflow/stage `tools/` capability definitions separately from deterministic `scripts/` mechanics.

Use [deployment guidance](../../../docs/deployment.md) for branch, environment, images, volumes, and secrets. Capability definitions do not prove a provider is connected or grant deployment/message permission. Follow the user's requested scope and existing authorization; do not dispatch a workflow merely because it exists.

For local validation, use `npm run repo -- component check --component <name>` after prerequisites are installed. Keep component-specific evidence in its workflow and secret values out of logs and handoffs. Use fake adapters for routine provider checks.

For a requested rollout, select the correct manual entrypoint/ref and preserve deployed data volumes. Record the actual result and recovery path. Report an unconfigured service rather than claiming it ran. For local orchestration, use the `tlis-devhost` project's own references; the devhost does not configure production deployments.

---
name: tlis-operations
description: Validate or operate a TLIS service using its project-specific service workflow, runtime configuration, and manual deployment entrypoints.
---

Identify the requested project and operation. Read that project's `CONTEXT.md` and `workflows/service/CONTEXT.md` where present. For the Discord bot, use its own operation workflow named in its context.

Use [deployment guidance](../../../docs/deployment.md) for branch, environment, image, volume, and secret configuration. A check operation does not grant deployment or external-message authorization. Follow the user's requested scope and existing approval; do not dispatch a workflow merely because it exists.

For local validation, use `node tools/src/cli.ts project check --project <name>` after the project prerequisites are installed. Keep service-specific commands and evidence in that project's workflow, and secrets out of artifacts and logs.

For a requested rollout, select the manual workflow and correct ref. Preserve the deployed Compose project name and data volumes. Record the ref, environment, actual outcome, and recovery path; report an unconfigured environment rather than claiming deployment succeeded.

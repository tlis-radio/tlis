---
status: awaiting-review
stage: 05_release
nextAction: Review the feature/portable-ai-workspace diff and validation evidence; complete the documented interactive harness discovery checks when available.
---

# Portable AI workspace implementation

State/data for TLIS contributors. The user asked to improve this repository according to the supplied implementation brief; source and method edits stay in their existing paths.

## Goal and recipient

Make the existing TLIS workspace portable across Codex/Claude Code and resumable without new scaffolds or a custom runtime. Recipient: TLIS contributors and their coding assistants.

## Acceptance criteria

- [x] Root map routes real jobs with read/skip/procedure/output/validation/decision contracts.
- [x] Existing paths distinguish method, facts, work, and verified outputs; no application reorganization.
- [x] Canonical skills export complete checked Claude bundles, preserve independent edits, and work from Windows/WSL.
- [x] Saved runs provide one task record, status, current stage, evidence, and next action.
- [x] New scripts pass meaningful example, malformed/conflicting input, isolation, and legacy tests.
- [x] A fresh independent session can resume from files; a distinct bot route rejects a stale external note and identifies missing deployment inputs.
- [x] Root checks pass, migration records remain unchanged, and handover documents actual verification limits.

## Authoritative inputs and versions

- User-supplied `ai_workspace_implementation_brief.md` attachment, SHA-256 `88e4342fc5bb4fa47b4090c251b0cd42f0fd5edbd78d16c8970f5c787a4134a9`, supplied 2 November 2026. Its design directions are applied within the user's request, not as runtime policy.
- Baseline `dev` revision: `991eeb3`; branch `feature/portable-ai-workspace`.
- Existing root/project guides, workflows, source/configuration and docs define actual jobs and facts.
- Official loading references and observed CLI versions are linked in `docs/harnesses.md`.

## Progress, checks, and artifact links

- Implemented root routing, path classification, setup/manual bootstrap, stage transitions, and skills with required inputs/validation/stop criteria.
- Generated three Claude skill copies in two scopes; exporter check and architecture check passed through Windows Node 24.14.1 on the WSL UNC workspace.
- A fresh Windows-drive checkout of implementation commit `eb14e7f` with symlinks disabled and automatic line endings enabled passed clean root installation, adapter/architecture checks, and task discovery. Git status remained clean.
- Root WSL TypeScript check and all 40 tests passed. Architecture/adapters and actionlint passed for all six manual workflows. History verification preserved 563 commits/40 refs; migration maps have no diff.
- The initial `workflow list` failed on an actual schema-v1 `agentic-rebuild` record. Added schema 1–3 compatibility, preserved both existing legacy runs unchanged, and confirmed list now succeeds. V4 task metadata remains validated.
- Independent bot routing exercise followed the bot guide/context/skill and current source, rejected a conflicting old external note, and identified missing deployment target/ref. It did not run Node because the default WSL PATH lacked it; this is reported accurately.
- A second fresh independent session discovered this task through `workflow list`, read the record/manifest and current stage, inspected Git, and recovered goal, criteria, recorded checks, limits, and next action without prior chat context. It correctly reported that the record still had pending verification at that time.
- New documentation links and all six canonical/generated skill frontmatters passed checking. Nine imported dashboard-note links remain pre-existing and outside scope.
- Source diff is the implementation artifact. Durable acceptance evidence is [the change report](../../../../docs/changes/portable-ai-workspace.md); setup and reproducible pending checks are in [the handover](../../../../docs/ai-workspace.md) and [harness guide](../../../../docs/harnesses.md).

## Open questions and blockers

No product decision is missing. Fresh interactive Codex CLI and Claude Code discovery is unverified; do not claim otherwise. No new hard access-control requirement was requested and no hook/permission changes are made.

## Next action and approval version

Use the metadata's next action. No separate implementation approval is required for this authorized reversible work. Any eventual merge/deployment review must name its actual ref/artifact; this task does not authorize production deployment or live Discord/calendar mutations.

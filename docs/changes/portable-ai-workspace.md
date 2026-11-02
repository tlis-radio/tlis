# Portable AI workspace implementation

The supplied `ai_workspace_implementation_brief.md` was applied to the existing TLIS layout. Its SHA-256 was `88e4342fc5bb4fa47b4090c251b0cd42f0fd5edbd78d16c8970f5c787a4134a9`, supplied 2 November 2026. The work improves file-based context and handover without reorganizing application code, adding another agent runtime, or changing personal harness settings.

## Result and authoritative paths

- [The root map](../../AGENTS.md) routes actual service changes, bot features, local orchestration, operations, repository/docs work, and historical verification. Each row names read/skip scope, procedure, output, validation, and the specific missing decision that might require a person.
- [Context selection](../../CONTEXT.md) locates existing authoritative project facts. Method, facts, active work, verified results, and historical data are classified in [the handover guide](../ai-workspace.md).
- Canonical `.agents/skills/` bundles export to complete `.claude/skills/` copies with ownership/hash manifests. [The exporter](../../scripts/src/skills.ts) checks drift, preflights conflicts before writes, preserves unrelated skills, and migrates recognized old adapters. Git attributes preserve bundle text hashes across line-ending settings. No shared facts are maintained independently in the generated copies.
- [Workflow initialization/discovery](../../scripts/src/workflows.ts) creates one task record beside the existing manifest and reports status/stage/next action without running a model. Existing schema 1–3 runs remain unchanged and readable. Stage artifacts remain local to the selected workflow/run.
- [Harness references](../harnesses.md) describe observed versions, root/nested loading differences, setup, guidance/enforcement limits, and pending discovery checks. Each `CLAUDE.md` still imports only `@AGENTS.md`.

The existing workflow paths implement the brief's method/work/output concerns. `libraries/` remains reserved for meaningful reuse; the small stream types stay local. No new prompt forms, role taxonomy, archive scaffold, service, MCP framework, permissions, hooks, scheduling, or personal skill installation is introduced.

## Executed verification

On the WSL checkout with Node 24.22.2:

```sh
npm run skills:sync
npm run skills:check
npm run check
npm test
npm run verify:architecture
npm run verify:history
```

Root typechecking and **41 tests passed**. Coverage includes complete bundle export with binary/nested assets and relative references, source updates, local-edit/independent-skill conflicts without writes, cross-scope preflight, legacy adapter migration, malformed manifests, ordinary filenames that match JavaScript object properties, escaping/cyclic paths, task discovery/isolation, missing/malformed state, legacy run schemas, and existing deployment/branch/impact behavior. These are script-entrypoint checks, not global access controls.

Architecture checks passed for five projects, nine agent workflows, six manual Actions definitions, reference files, canonical Claude imports, and generated adapters. History verification confirmed 563 source commits and 40 historical refs with preserved metadata, trees, and parent graphs. Migration maps were not edited. All six Actions definitions passed actionlint 1.7.7; the root manual workflow now explicitly checks skill export drift.

Windows Node 24.14.1 successfully ran `node scripts/src/cli.ts skills check` and `architecture check` against the same UNC checkout. A fresh local Windows-drive checkout of implementation commit `eb14e7f`, with `core.symlinks=false` and `core.autocrlf=true`, also passed clean `npm ci`, skill/architecture checks, and task discovery with a clean Git status. All three generated bundles matched their manifests and the saved task was recoverable. This verifies checkout/command portability without symlink privileges; it does not claim every application/runtime works under native Windows.

New documentation links and all six canonical/generated skill frontmatters passed checking. Nine pre-existing broken links in the imported website dashboard implementation note remain outside this change. Application source, dependencies, locks, and Docker contexts are unchanged, so application builds were not repeated for this method-only revision.

## Real job, contrasting route, failure, and resume

The representative job was this workspace improvement itself: it used the shared change route, updated actual procedures/scripts, exported three skills, initialized a v4 task, inspected the output, and executed its acceptance checks. A sanitized [task record](../../workflows/change/output/portable-ai-workspace/task.md) and [manifest](../../workflows/change/output/portable-ai-workspace/run.json) are explicitly included for handover; ordinary run outputs remain ignored.

A fresh independent read-only session used the root map to answer a bot command validation/preview request. Its tool reads were scoped to the root map and the bot's guide, context, feature skill, README/package/configuration, startup and registration scripts, development/configuration references, and relevant offline tests. It read no sibling project internals or migration maps. Current source disproved a harmless conflicting external handover note: Discord is disabled by default, startup does not register commands, and preview returns before REST mutation. The result named exact commands and reported that its default WSL PATH lacked Node rather than fabricating a test pass.

For a deployment follow-up lacking a target/environment/ref, that session identified the missing inputs and existing hosting/credential setup instead of inventing a destination or taking external action. This verifies routing/scope and a missing-input response using observable reads, not merely a claim of skill use. No fake fact was inserted into an authoritative project record.

Another fresh independent session discovered the active task using `node scripts/src/cli.ts workflow list`, read its record/manifest and current verification stage, inspected Git branch/diff, and recovered the goal, recipient, completed evidence, pending work, and next action without prior chat history. It correctly reported incomplete criteria and absent final evidence at that moment. Windows npm's UNC failure was observed and the direct Node entrypoint succeeded. The actual list initially exposed a schema-v1 compatibility failure; that was fixed and tested while preserving the existing runs.

The task record now links the final acceptance evidence. Fresh interactive Codex CLI and Claude Code auto-discovery remains **pending**, with exact root/project verification steps in the harness guide. Subagent exercises do not establish another harness's automatic loading. No new hard restriction was required, so no hook-based enforcement is claimed or tested. No production deployment or live Discord/calendar operation was performed.

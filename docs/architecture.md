# Agent workflow architecture

This repository adapts the paper *Interpretable Context Methodology: Folder Structure as Agent Architecture* by Jake Van Clief and David McDermott (arXiv:2603.16021v2, 2026). The paper describes file-based coordination for sequential, reviewable work. TLIS uses those ideas for code changes and service operations; the model remains responsible for judgment while TypeScript handles repeatable mechanics.

## Five context layers

| Layer | TLIS location | Purpose |
| --- | --- | --- |
| 0: identity and durable rules | Root and project `AGENTS.md` | Project boundaries, branch policy, persistent constraints |
| 1: routing | Root/project/workflow `CONTEXT.md` | Select a project, workflow, and stage |
| 2: stage contract | Numbered `stages/01_*/CONTEXT.md` | Explicit inputs, process, outputs, and verification |
| 3: stable references | `shared/references/`, project configuration, skills | Conventions and operating knowledge reused between runs |
| 4: working artifacts | Stage `output/<run-id>/`, scoped source inputs | Task-specific evidence and editable handoffs |

The root change workflow has five stages: scope, plan, implement, verify, and release. A project service workflow has focused inspect, verify, and operate stages. The number expresses order, while the contract identifies exactly what a stage needs. This is a convention interpreted by the agent, not a background process.

A stage loads the referenced sections needed for its task. It does not preload other projects or every preceding artifact. A downstream stage uses the current saved handoff, including human edits. A run ID keeps two contributors' artifacts from overwriting one another. Outputs are local by default because they can contain transient or sensitive material; sanitized decisions can be committed intentionally.

## Shared and project-specific ownership

Shared workflows, task prompts, engineering conventions, and TypeScript mechanics live at the root. Each project keeps its code, runtime configuration, local guidance, service workflow, prompts, and deterministic checks. `_config/projects.json` discovers projects; the per-project `_config/project.json` declares their own check behavior.

Avoid copying the same prompt into every project. The shared change stages consume the relevant project context. Local service stages carry details that differ: build arguments for the website, media paths for video, or shared-volume constraints for audio.

`tools/src/cli.ts` exposes repeatable operations with validated inputs and explicit project selection. It handles project discovery, changed-project selection, workflow run initialization, branch creation, architecture checks, and history verification. Project tools use the same runner where appropriate. The agent writes and evaluates a plan; the tool performs the specified mechanical step. Tool invocation does not automatically authorize external side effects.

## Codex and Claude Code

`AGENTS.md` is the canonical instruction file. Each `CLAUDE.md` contains only:

```text
@AGENTS.md
```

This makes Claude import the same local instructions without duplicating policy. Project files provide specific guidance when working inside that project. Start Codex in the target project directory when you need its nested instructions available from the beginning.

Shared skills are authored once in `.agents/skills/<name>/SKILL.md`. Each matching `.claude/skills/<name>` entry links to that canonical folder. Codex supports symlinked skill folders, and Claude documents symlinked skill entries. Check out the repository with working symlinks; WSL/Linux is suitable. On native Windows, enable Git symlink support with the necessary Windows privileges before relying on linked skills.

There are no checked-in global permission overrides, automatic external-service connectors, or user credentials. Host-specific settings remain local. Skills and stage contracts describe how to work; they are not substitutes for tool permissions or the user's authorization.

## Review and iteration

Use the stages needed for the size of the task. A typo does not require a release dossier. For a substantial change, stage artifacts provide concrete review points: scope and acceptance criteria, design tradeoffs, implementation evidence, test results, and rollout details. Respect review points agreed for that run; existing task authorization may cover consecutive stages.

When repeated corrections reveal a missing convention, improve the relevant stable reference or stage contract. Do not turn one task's preference into a rule for unrelated projects.

This layout does not supply a scheduler, concurrency coordinator, automatic retries, or enforced approvals. GitHub Actions performs only the explicitly dispatched checks or deployments. More complex orchestration can be added when an actual need appears.

## Sources

- [ICM paper](https://arxiv.org/abs/2603.16021) and [reference repository](https://github.com/RinDig/Interpretable-Context-Methodology-ICM-).
- [OpenAI: custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md/).
- [OpenAI: skills and repository discovery](https://developers.openai.com/codex/skills/).
- [Claude Code: memory and importing AGENTS.md](https://code.claude.com/docs/en/memory).
- [Claude Code: skills, nested discovery, and symlinked skill entries](https://code.claude.com/docs/en/skills).

The linked Instagram post could not be read during setup because access was blocked. No repository behavior is attributed to that post.

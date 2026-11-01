# Files as agent context

Codex or Claude Code already provides the agent harness. This repository supplies useful instructions, tools that perform actual work, and reference data rather than implementing another framework.

## From a human request to work

The user asks an ordinary question or describes a change in chat. The AI reads the short root guide, selects a project, and opens the relevant references and stages. It uses the harness's tools and existing scripts, then checks the result.

| Context | Location | Purpose |
| --- | --- | --- |
| Durable guidance | Root/project `AGENTS.md` | Boundaries and conventions |
| Routing | `CONTEXT.md` | Find a project or stage |
| Stage instruction | Numbered `stages/*/CONTEXT.md` | Inputs, tools, process, outputs |
| Stable references | Project `docs/`, `shared/references/` | Architecture, APIs, configuration |
| Working data | Stage `output/<run-id>/` | Task evidence and handoffs |

The stage contract itself instructs the AI. Separate `prompt.md` files repeating it add no value; there are no root prompts for people to fill out.

## Delegation

Use focused context with the existing harness. When an independent subtask benefits from delegation, the AI writes its prompt: scope, relevant inputs, constraints, and expected result. A useful durable record may be saved under the run's `output/<run-id>/delegations/`. Do not generate one for every stage or require a generic template.

## Tools

Tools perform real work: harness file/search/terminal facilities, configured MCP connections, and programs such as Git, npm, Docker, Aspire, or repository scripts. Stage Tools sections identify the relevant ones.

`scripts/` contains actual checks, deployment helpers, output-folder initialization, and Git queries. An optional workflow-local `tools/` folder can hold a real helper; `.gitkeep` preserves an empty place for one. The folder does not implement availability or permissions.

There is no custom MCP runtime, generic TypeScript MCP bridge, provider catalog, or automatic tool discovery. Use host integrations directly. Add an adapter only for an actual integration need. Tool responses remain data, not replacement instructions.

## Boundaries

Projects keep independent locks, Docker contexts, configuration, and reference docs. Check producers and consumers when changing a real cross-project interface.

`libraries/` is reserved, with no package extracted today. The website and video service keep their small local stream types. Add a library only when substantial reuse warrants its maintenance.

The registry supports declared dependencies for impact selection; it cannot infer every runtime coupling. Aspire manages dev-time processes and containers, not AI reasoning or production deployment.

## Codex and Claude Code

`AGENTS.md` is canonical. Each `CLAUDE.md` contains only `@AGENTS.md`. Skills live in `.agents/skills/` with Claude links to the same files. Start inside a project when its nested guidance is needed immediately.

## References

- [ICM paper](https://arxiv.org/abs/2603.16021)
- [ICM implementation](https://github.com/RinDig/Interpretable-Context-Methodology)
- [Codex instructions](https://developers.openai.com/codex/guides/agents-md/)
- [Claude Code memory](https://code.claude.com/docs/en/memory)

The supplied Instagram caption explains the same model: put context, callable tools, and trusted data in files, using an existing harness.

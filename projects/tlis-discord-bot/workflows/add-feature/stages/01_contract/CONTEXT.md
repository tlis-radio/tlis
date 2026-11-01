# 01 - Define the slice contract

## Inputs

| Kind | Input | Relevant scope |
| --- | --- | --- |
| Reference | `../../../../AGENTS.md` | Project boundaries and external service behavior |
| Reference | `../../../../src/shared/commands.ts` | Request and reply interface |
| Reference | Existing adapter interface relevant to the task | Provider-independent contract |
| Working | Current user request and supplied service documentation | Intended behavior and constraints |

## Process

Define the feature request, validation rules, reply, expected failures, and provider boundary. Identify what can be tested without credentials and what needs a later live setup. Read only the external documentation needed for the selected integration.

## Outputs

Write `output/<run-id>/contract.md` with behavior examples, the service interface, accepted user decisions, and unresolved choices. Use `prompt.md` as the task template.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

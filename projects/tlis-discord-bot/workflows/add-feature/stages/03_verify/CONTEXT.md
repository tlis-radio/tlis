# 03 - Verify the slice

## Inputs

| Kind | Input | Relevant scope |
| --- | --- | --- |
| Working | `../01_contract/output/<run-id>/contract.md` | Expected observable behavior |
| Working | `../02_slice/output/<run-id>/implementation.md` | Implementation choices and configuration |
| Reference | `../../../../scripts/check.ts` | Deterministic typecheck, tests, and build |
| Reference | `../../../../tools/register-commands.ts` | Read-only preview of Discord command definitions |

## Process

Run `node scripts/check.ts` from the project and inspect failures against the contract. Preview command definitions with `npm run commands` when they changed. Verify external errors do not disclose tokens or calendar URLs. Record live checks that require the team's configured application separately; do not substitute simulated results for them.

## Outputs

Write `output/<run-id>/verification.md` with exact checks and results, configuration still needed, and any remaining risk. Use `prompt.md` for the review task.

## Tools

Read this workflow or stage's local `tools/` capability directory. A tracked `.gitkeep` means no external/MCP capability is declared at that scope. Definitions do not connect providers or grant task authorization. Deterministic checks and maintenance run from `scripts/`.

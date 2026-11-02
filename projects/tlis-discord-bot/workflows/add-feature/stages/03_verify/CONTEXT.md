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

Write `output/<run-id>/verification.md` with exact checks and results, configuration still needed, and any remaining risk.

## Tools

Use harness file/search/edit tools and Git. Run `npm run check` from this project. Use command preview for changed command definitions and offline adapter tests for integrations; live Discord/calendar calls follow the current task authorization.

## Verify

The project check passes and acceptance examples are covered. Inspect command preview if definitions changed. Record exact checks and missing live-service validation; do not infer Discord/calendar success from offline tests.

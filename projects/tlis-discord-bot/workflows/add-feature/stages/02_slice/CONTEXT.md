# 02 - Implement the vertical slice

## Inputs

| Kind | Input | Relevant scope |
| --- | --- | --- |
| Working | `../01_contract/output/<run-id>/contract.md` | Current accepted behavior and decisions |
| Reference | `../../../../src/app.ts` | Feature registration pattern |
| Reference | Relevant `src/features/` and `src/integrations/` files | Existing contracts and reusable adapters |
| Reference | Corresponding files in `../../../../tests/` | Observable behavior to preserve |

## Process

Keep validation, handler, and mapping together in the feature folder. Put provider transport in an adapter behind a port. Inject a clock, service, or HTTP client when needed for offline tests. Update `app.ts` and the smallest relevant documentation.

## Outputs

Commit-ready code and tests plus `output/<run-id>/implementation.md` recording changed files, contract decisions, and any new configuration. Use `prompt.md` for the implementation task.

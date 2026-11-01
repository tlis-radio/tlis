# Bot task routing

| Task | Read next |
| --- | --- |
| Start or configure the bot | `README.md`, `.env.example`, `src/config.ts` |
| Add a command or external integration | `workflows/add-feature/CONTEXT.md` |
| Change a single feature | Its folder under `src/features/` and corresponding tests |
| Change Discord transport | `src/integrations/discord/`, then the feature contract it maps |
| Change calendar behavior | `src/integrations/calendar/`, `tests/calendar.test.ts`, `tests/slices.test.ts` |
| Validate locally | `node tools/check.ts` |

Stable context is committed configuration, contracts, source, tests, and prompts. Per-task artifacts go in the selected workflow stage's `output/<run-id>/` folder and are not instructions. Read only the current stage's listed inputs.

# Audio streaming stack: task routing

| Task | Load |
| --- | --- |
| Audio routing or fallback behavior | `liquidsoap/tlis-station.liq`, relevant `icecast/` configuration |
| Schedule change | `liquidsoap/scheduled.json` and its consuming script |
| Local validation or operation | `workflows/service/CONTEXT.md`, `tools/README.md` |
| Multi-stage feature or fix | Root `workflows/change/CONTEXT.md`, scoped project source |
| Cross-service contract | Root `shared/references/integrations.md`, relevant consumer/provider |

Stable runtime references: compose.yaml, icecast/, liquidsoap/, and the environment variable names used by those files. Load environment variable names and contracts without placing credential values in run artifacts.

Service stages live in `workflows/service/stages/`. Write working evidence to the current stage's `output/<run-id>/`; source code stays in its normal location. Use the saved output of this run, not another contributor's artifacts.

The original README remains the runtime starting point. Root deployment and branch conventions apply after import.

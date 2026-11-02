# Aspire removal and native Windows checks

Removed `projects/tlis-devhost`, its package/lock, topology, CLI wrappers, SDK configuration, tests, and local workflow. The registry now contains four independent application services. Component validation no longer offers the host or installs Aspire. Current routing, setup references, and the operations skill point to project-local commands; generated Claude skill copies and hashes are synchronized.

The saved shared workspace task now uses a surviving project registration for discovery. Its record notes the original host association and retains its review status and evidence.

Repository tooling runs natively on Windows with Node 24 and Git. Generated skills use ordinary file copies. Directory-link test fixtures use Windows junctions without symbolic-link privileges; file-link fixtures were replaced with directory-redirection cases. The manual repository verification workflow includes Windows and Ubuntu, with its existing Linux actionlint step limited to the Ubuntu job. Setup guidance no longer requires WSL or a Linux toolchain.

Validated on native Windows with Node 24.22.2:

| Check | Result |
| --- | --- |
| `npm run check` | Passed |
| `npm test` | 42 passed, 1 skipped; the skipped source-name collision test requires a case-sensitive filesystem |
| `npm run skills:check` | Passed; no drift |
| `npm run verify:architecture` | 4 components, 8 agent workflows, 6 manual Actions definitions |
| `npm run verify:history` | 563 imported commits and 40 archived refs verified; metadata, trees, and parent graphs preserved |
| Windows actionlint 1.7.7 | All six Actions definitions passed; release archive checksum verified |
| `npm run repo -- workflow list` | Saved shared tasks remain discoverable after removal |
| Removal/consistency checks | Host directory absent and lookup rejected; CI project choices match the four registered services; active files contain no Aspire references |
| Markdown links and whitespace | Modified local Markdown links resolve; `git diff --check` passed |

Application runtime code, application locks, Docker contexts, migration maps, and archived refs were preserved. The [original introduction report](agent-workspace-and-aspire.md) remains labeled historical evidence. Service startup, deployment, and external integrations were not exercised by this repository change.

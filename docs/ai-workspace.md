# Working in the AI workspace

TLIS supports a small team changing independent services, adding bot slices, testing local integration, and preparing releases. Describe the desired outcome in ordinary chat; the AI selects relevant context and uses the existing harness.

## Setup

Use Node 24 from `.nvmrc`, Git, and the selected project's prerequisites. Install root dependencies with `npm ci`, then run:

```sh
npm run skills:check
npm run check
npm test
npm run verify:architecture
```

Generated Claude skill bundles are committed. Edit the corresponding root/project `.agents/skills/` only, then run `npm run skills:sync` and review the source, generated bundle, and manifest together. Independently authored or modified destinations require review; export preserves unrelated skills. [Harness setup](harnesses.md) documents loading rules and verification limits.

Read the [map](../AGENTS.md), select the route, and load the selected local guide. A bot command uses its feature workflow and offline tests; an audio configuration change uses its own Compose context. Cross-project work includes actual providers and consumers.

## Path meanings

| Concern | Existing paths | Kind and authority |
| --- | --- | --- |
| Method | Guides, `.agents/skills/`, workflow `CONTEXT.md`, `scripts/` | Instructions/procedures and executable helpers; generated Claude copies are adapters |
| Facts | Source/configuration, project `docs/`, `shared/references/` | Reference data; source/configuration defines actual runtime behavior |
| Work | Workflow `output/<run-id>/task.md`, `run.json`, stage `output/<run-id>/` | Task state/data and drafts, never new policy |
| Outputs | Normal application source, requested deliverable path, verified evidence | Finished after acceptance; link from task record |
| History | `docs/migration/`, `archive/*` Git refs | Historical data; skip during routine work |

Projects deliberately mix code/data and local instructions, identified by filename. Keep source edits in place. These paths already serve the brief's context/work/output concerns; no parallel taxonomy is needed. Link each fact to its authoritative home.

## Save and resume

For substantial work, the AI chooses a run ID and optionally initializes a record:

```sh
npm run repo -- workflow init --workflow change --scope shared --component tlis-devhost --run workspace-update --goal "Improve workspace portability" --recipient "TLIS contributors"
npm run repo -- workflow list
npm run repo -- workflow list --all
```

The initializer chooses a component workflow unless shared scope is requested. It creates one `task.md` and routing manifest beside it, plus stage output folders; it does not execute stages. The AI fills acceptance criteria and input versions from the ordinary request. Missing material input becomes a clear question or `blocked` record, not invented facts. The task record is human-editable state, not a form for the user.

Statuses are `ready`, `in-progress`, `blocked`, `awaiting-review`, and `done`. Maintain stage and next action in YAML metadata. The body records goal/recipient, acceptance, authoritative inputs/versions, artifacts/checks, open questions, and any approval with its reviewed version/ref. Record failures and recovery steps accurately.

A fresh session runs `workflow list`, selects the matching task, reads its record/manifest, checks Git branch/diff, then opens the current stage and linked evidence. Old versions 1–3 remain untouched and appear as legacy records; add a task record manually if useful. Do not resume another person's run solely because its name is similar.

Advance when the stage's validation meets its transition criterion and no material decision/authorization is missing. Mark `done` only when route acceptance passes with linked results and evidence. Scripts cannot judge application correctness. Continue authorized reversible steps without routine approval requests; an actual review gate covers the reviewed version.

Run folders are ignored. For a handoff, share sanitized state plus evidence or explicitly commit selected files using `git add -f <path>`. Local ignored state does not travel to another checkout automatically. Durable project facts belong in project docs; reusable method corrections belong in the relevant skill; routing corrections belong in the map. One-off preferences remain task-local. Verified change reports can live under `docs/changes/`.

## Add the next procedure

Identify a recurring job, real inputs/output, acceptance check, and actual human decision. Reuse a skill/workflow first. Add a new skill only for a distinct reusable method, with portable name/description frontmatter and links to authoritative facts. Add its routing row, focused stage contract if needed, export/check adapters, then exercise the job and a contrasting route. Do not copy project facts into skills.

Concurrent work uses distinct run paths and isolated branches/worktrees when edits could overlap. One integrator owns shared instructions and checks the combined result. Retire obsolete drafts outside routine routing when a real historical need exists; no empty archive or correction-log scaffold is needed.

## Chat without filesystem access

Attach the map, selected local guide/context, relevant reference sections, skill/stage, current task record, and required inputs. Ask normally for the outcome, receiving pasteable patches or downloadable deliverables with validation steps. Apply and check them in the repository. Such a chat has no automatic discovery, durable updates, scripts, hooks, or service access unless the interface actually supplies them. Suggested commands are not executed checks.

## Handover

[Implementation evidence](changes/portable-ai-workspace.md) records representative work, route contrast, scope/failure/resume checks, and pending harness verification. After method changes rerun the setup checks. Application acceptance still uses project commands; history verification is separate and needs all archived refs.

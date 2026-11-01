# Repository maintenance scripts

Use Node 24.12 or newer in the 24.x line (`.nvmrc` pins the tested version), then run `npm ci` at the repository root. Root dependencies belong to tooling; each application keeps its own package and lockfile.

```sh
npm run repo -- projects list
npm run repo -- changes --base dev --head HEAD
npm run repo -- project check --project videostream
npm run repo -- workflow init --workflow change --project cms-web --run article-fix
npm run repo -- architecture check
npm run repo -- history verify
```

`projects list` reads `_config/projects.json`. Each project's own `_config/project.json` and `scripts/check.ts` define its checks. Install that project's dependencies first; the dispatcher does not install packages or start services. `cms-web` checks types, `videostream` compiles, the audio stack validates Compose without printing expanded secrets, and the bot runs its typecheck, tests, and build.

`changes` resolves the two Git refs to commit IDs, then returns JSON listing changed files and affected components. A cross-component rename selects both components. Changes outside registered components conservatively select all components. This command reports impact and does not execute checks or workflows.

`workflow init` selects the component-local workflow first, then falls back to the shared workflow. Use `--scope shared` to select the root contract explicitly, or `--scope component` to require a local one. It discovers numbered stages, writes a per-run manifest under the workflow's `output/<run>/`, and creates each stage's own output folder. The manifest records context, prompt, and capability-directory paths. It does not call a model, discover credentials, or execute stage tools. Existing runs are never overwritten.

Use `components list` and `component check --component <name>` for either projects or libraries. The older `projects list` and `project check --project <name>` forms remain available. `npm run tool` remains an alias for repository maintenance; `npm run repo` is the clearer entrypoint. Agent-facing MCP APIs and external capabilities live under root/component/workflow `tools/`, separately from these scripts.

`changes` includes a changed library and every transitive consumer declared by `dependsOn` in `_config/projects.json`. An application-only change does not select sibling applications. Changes to shared repository infrastructure conservatively select all components. The command reports impact; it does not execute every affected component automatically.

To create a feature branch:

```sh
git switch dev
git pull --ff-only
npm run repo -- branch feature --name calendar-announcements
```

This requires a clean worktree on `dev` and creates `feature/calendar-announcements`. It does not fetch, switch away from another branch, commit, or push for you. Open a PR into `dev`; release `dev` into `main`. Archived source refs remain historical snapshots.

## Predictability boundary

The model interprets a request and writes readable plans and changes. TypeScript handles path validation, command arguments, Git queries, workflow folders, tests, build execution, API serialization, and deployment requests. Commands use argument arrays with `shell: false`; names and project paths are validated. Repository-owned check scripts are trusted code and should be reviewed like application changes. These tools do not evaluate model-written strings as code and do not include an AI orchestration framework.

TypeScript runs directly through Node's type stripping. `npm run check` performs the separate static typecheck; native execution alone does not check types. Use erasable TypeScript syntax and explicit imports. See [Node TypeScript support](https://nodejs.org/docs/latest-v24.x/api/typescript.html).

## Deployment helpers

The root manual workflows call `scripts/deploy/deploy.ts`. An offline plan needs only a branch and repository owner:

```sh
GITHUB_REF=refs/heads/dev GITHUB_REPOSITORY_OWNER=tlis-radio \
  node scripts/deploy/deploy.ts cms-web-dev --dry-run
```

Real execution uses environment secrets, builds and pushes the existing image, then calls the configured deployment endpoint once. It does not retry deployments automatically. Website Discord notifications are separate opt-in behavior. See [deployment setup](../docs/deployment.md) before invoking a real deployment.

## Validation

```sh
npm run check
npm test
npm run verify:architecture
npm run verify:history
```

Unit tests use temporary Git repositories and mocked HTTP/command adapters. They do not publish images, deploy services, register Discord commands, or send messages. History verification needs a full clone containing all archived branches.

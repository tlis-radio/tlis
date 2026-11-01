# Deterministic TypeScript tools

Use Node 24.12 or newer in the 24.x line (`.nvmrc` pins the tested version), then run `npm ci` at the repository root. Root dependencies belong to tooling; each application keeps its own package and lockfile.

```sh
npm run tool -- projects list
npm run tool -- changes --base dev --head HEAD
npm run tool -- project check --project videostream
npm run tool -- workflow init --workflow change --project cms-web --run article-fix
npm run tool -- architecture check
npm run tool -- history verify
```

`projects list` reads `_config/projects.json`. Each project's own `_config/project.json` and `tools/check.ts` define its checks. Install that project's dependencies first; the dispatcher does not install packages or start services. `cms-web` checks types, `videostream` compiles, the audio stack validates Compose without printing expanded secrets, and the bot runs its typecheck, tests, and build.

`changes` resolves the two Git refs to commit IDs, then returns JSON listing changed files and affected projects. A cross-project rename selects both projects. Changes outside a registered project conservatively select all projects. This command reports impact and does not execute checks or workflows.

`workflow init` selects the shared workflow if its name exists under root `workflows/`, otherwise the selected project's workflow. It discovers numbered stages, writes a per-run manifest to `<workflow>/output/<run>/run.json`, and creates each stage's `output/<run>/` folder. It neither calls a model nor advances stages. Read the selected stage's `CONTEXT.md` and `prompt.md`, write its declared artifacts, and carry only its listed inputs forward. Existing runs are never overwritten. Working output is ignored by Git; deliberately add sanitized handoffs when they should be shared.

To create a feature branch:

```sh
git switch dev
git pull --ff-only
npm run tool -- branch feature --name calendar-announcements
```

This requires a clean worktree on `dev` and creates `feature/calendar-announcements`. It does not fetch, switch away from another branch, commit, or push for you. Open a PR into `dev`; release `dev` into `main`. Archived source refs remain historical snapshots.

## Predictability boundary

The model interprets a request and writes readable plans and changes. TypeScript handles path validation, command arguments, Git queries, workflow folders, tests, build execution, API serialization, and deployment requests. Commands use argument arrays with `shell: false`; names and project paths are validated. Repository-owned check scripts are trusted code and should be reviewed like application changes. These tools do not evaluate model-written strings as code and do not include an AI orchestration framework.

TypeScript runs directly through Node's type stripping. `npm run check` performs the separate static typecheck; native execution alone does not check types. Use erasable TypeScript syntax and explicit imports. See [Node TypeScript support](https://nodejs.org/docs/latest-v24.x/api/typescript.html).

## Deployment helpers

The root manual workflows call `tools/deploy/deploy.ts`. An offline plan needs only a branch and repository owner:

```sh
GITHUB_REF=refs/heads/dev GITHUB_REPOSITORY_OWNER=tlis-radio \
  node tools/deploy/deploy.ts cms-web-dev --dry-run
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

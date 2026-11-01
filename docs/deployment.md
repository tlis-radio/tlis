# Manual workflows and deployment

All active GitHub Actions entrypoints are in root `.github/workflows/` and use `workflow_dispatch`. GitHub's **Actions -> workflow -> Run workflow** control selects the branch. Manual dispatch does not have a path filter; branch and path filtering belongs to optional push or pull-request triggers.

| Workflow | Selected branch | Target |
| --- | --- | --- |
| Website development | `dev` | `cms-web-development` environment; `tlis-web-dev:latest` |
| Website production | `main` | `cms-web-production` environment; `tlis-web:latest` |
| Video production | `main` | `videostream-production` environment; `video-stream:latest` |
| Repository verification | Work to verify | Shared architecture/tools/history checks |
| Project validation | Work to verify | Selected project's checks/build |

The deployment workflows guard their expected branch. Every automatic trigger example is commented out. To enable one later, uncomment its complete event block inside `on:`; both branch and path conditions then apply. For example:

```yaml
on:
  workflow_dispatch:
  # push:
  #   branches: [dev]
  #   paths:
  #     - 'projects/cms-web/**'
  #     - '.github/workflows/cms-web-dev.yml'
  #     - 'scripts/deploy/**'
```

The workflow definition must exist on the repository's default branch for the manual button to be available. A manual run can select another branch with the appropriate workflow definition. No manual build or deployment has to be triggered just because files were pushed.

## Existing deployments

The website and video workflows retain their existing image names and deployment HTTP methods. Docker build contexts remain `projects/cms-web` and `projects/videostream`, with independent package locks and local stream types. Predictable URL validation and notification payload construction live in `scripts/deploy/`, executed as TypeScript with Node 24. Website Discord notification is an explicit manual option and is off by default.

Original workflow snapshots are retained in the migration documentation; active copies no longer depend on `develop` or `master` triggers. Streamserver had no GitHub deployment workflow. Its Compose operation remains project-specific. The Discord bot is a new project and requires its own credentials and deployment choice.

## Environment setup

Use project-scoped GitHub environments so the same secret name cannot accidentally select another service:

- `cms-web-development`: `DIRECTUS_URL`, `DEPLOY_URL`, `DEV_DEPLOY_ID`, `DEPLOY_SECRET`; optional notification values `DISCORD_FORUM_WEBHOOK_URL` and `THREAD_ID`.
- `cms-web-production`: `DIRECTUS_URL`, `ANALYTICS_ID`, `ANALYTICS_URL`, `SITE_URL`, `DEPLOY_URL`, `PROD_DEPLOY_ID`, `DEPLOY_SECRET`; optional notification values `DISCORD_FORUM_WEBHOOK_URL` and `THREAD_ID`.
- `videostream-production`: `DEPLOY_URL`, `PROD_DEPLOY_ID`, `DEPLOY_SECRET`.

`GITHUB_TOKEN` is generated per run. Grant the new repository access to the existing GHCR packages before expecting that token to push existing image names. Repository secrets, environments, branch restrictions, reviewers, package permissions, and deployment settings are GitHub configuration; importing Git history does not copy them.

## Cutover

Configure environments and deployment checkouts first. For services that checkout code directly, set the project subdirectory as the build context. Test a development run, then coordinate the production switch and disable the old deployment trigger when ready. Source repository automation is unchanged by this import and can still deploy until cutover.

Run Compose from the project folder so environment files and bind mounts resolve consistently. Preserve the old Compose project name or explicitly set `--project-name` where existing named volumes must be reused. Audio and video both expose host port `8000`; assign distinct host ports when colocating them.

Do not print a fully resolved Compose configuration or secret-bearing URLs in logs. Validate with `docker compose config --quiet`, then inspect only the fields needed for the operation.

## Primary documentation

- [GitHub: workflow_dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).
- [GitHub: triggering workflows and branch/path filters](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
- [GitHub: deployment environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

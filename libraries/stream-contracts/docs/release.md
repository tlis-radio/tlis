# Versioned local release

This repository does not publish `@tlis/stream-contracts` to npm or GHCR. A release is an explicit update of canonical source plus versioned local archives in the two consumers.

1. Follow the local change workflow and review the contract and consumer compatibility. Adding or changing lifecycle values or required fields is an API decision, even when TypeScript accepts the edit.
2. Set the intended version locally, for example `npm version 0.1.1 --no-git-tag-version`. Commit the matching library package and lockfile as part of the change. Source or packaged-documentation changes should receive a new distribution version rather than silently replacing a released archive.
3. Run `npm run vendor:sync`. It builds the library, packs canonical package contents in a temporary directory, copies the same versioned archive into both consumer `vendor/` folders, and updates their package declarations and lockfiles with npm's offline local-file handling. It does not install consumer dependencies or call an external registry.
4. Run `npm run check`. Its parity check repacks canonical source and compares both archive bytes and lockfile integrity. A changed source with stale archives fails this check.
5. Reinstall and check both consumers: `npm ci --legacy-peer-deps` in the website and `npm ci` in video, then run their component checks from the repository root. The full website build additionally needs its service configuration. Runtime OBS, Directus, and deployment checks remain separate from type/build compatibility.
6. Review the source diff, both consumer DTOs, versioned archives, lockfile changes, and build evidence together in one feature PR to `dev`. Promote through the normal release process. No Git tag, registry publish, image push, or deployment happens automatically.

Maintenance entrypoints:

```sh
node scripts/sync-consumers.ts --check  # Build/pack comparison; no consumer writes
node scripts/sync-consumers.ts --write  # Update both local distributions and locks
```

The npm package list is explicitly limited to `dist/`, `docs/`, `README.md`, and package metadata. Scripts and working output do not enter the distribution. Old unused archive files may be removed deliberately in the release change after checking that no package or lockfile references them.

See [npm's pack documentation](https://docs.npmjs.com/cli/v12/commands/npm-pack/) for local tarball behavior. Consumer Dockerfiles copy `vendor/` before installation, so a project-only build context stays complete.

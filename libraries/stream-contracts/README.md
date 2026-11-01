# TLIS stream contracts

The shared stream lifecycle used by `projects/cms-web` and `projects/videostream`. It extracts their existing status values and common Directus fields; consumer-specific episode models and private-key requirements remain local.

```ts
import type { StreamRecord, StreamStatus } from "@tlis/stream-contracts";
```

## Validate

Use Node 24 for maintenance scripts. The generated library itself has no runtime dependencies.

```sh
npm ci
npm run check
```

The check typechecks source and maintenance scripts, builds CommonJS plus declarations, tests both consumer resolution modes, and confirms the versioned archives and lockfiles match canonical source. `npm run build` and `npm test` can also run independently of consumer integration checks.

## Source and distribution

`src/` is the single source of truth. Each consuming project installs a packed copy from its own `vendor/` folder so its lockfile and Docker build context stay independent. Edit source, never an archive. Versioning and synchronization are explicit local release steps:

```sh
npm run vendor:check
# After an accepted versioned change:
npm run vendor:sync
```

Synchronization writes local archives and updates the two consumer package declarations/lockfiles. It does not publish a package, install consumer `node_modules`, build a service image, or deploy anything. `--check` performs no consumer writes.

See the [documentation index](docs/README.md), [API](docs/api.md), [usage](docs/usage.md), and [release procedure](docs/release.md).

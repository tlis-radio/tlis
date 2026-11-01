# Usage

The package is consumed through a versioned local dependency declared by each project's package and lockfile:

```json
"@tlis/stream-contracts": "file:vendor/tlis-stream-contracts-0.1.0.tgz"
```

Run `npm ci` from the consuming project (`--legacy-peer-deps` for `cms-web`). Nothing resolves outside that project's folder during installation or container builds.

Use type-only imports for DTO definitions:

```ts
import type { StreamRecord } from "@tlis/stream-contracts";

interface MyEpisode { id: string | number }
interface PrivateStream extends StreamRecord<MyEpisode | string | number | null> {
  stream_key: string;
}
```

Keep episode-specific fields and private data requirements local. Existing imports from the website's `src/types/stream.ts` and video's `src/types.ts` continue to work because those files re-export `StreamStatus` and retain their DTO names.

To change a contract, edit the canonical library and use its change/release workflows. Do not unpack and patch a consumer archive. After synchronization, reinstall each consumer from its unchanged independent dependency graph plus the new local archive, then run the affected component checks.

The library maintenance runtime is Node 24. Its CommonJS distribution uses ordinary JavaScript and does not impose a Node 24 runtime upgrade on the video service.

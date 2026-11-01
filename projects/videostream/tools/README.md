# Project tools

`check.ts` is the deterministic check entrypoint. `../_config/project.json` declares its command. From the repository root:

```sh
node tools/src/cli.ts project check --project videostream
```

Install dependencies here with `npm ci`; the declared project check runs `npm run build`. Runtime checks need FFmpeg and configured Directus access. A successful TypeScript build does not exercise OBS ingest, recording, or archive finalization.

Keep project-specific checks and transformations here. Shared validation and process launching belong in root `tools/`. New tools use typed arguments and `shell: false`, predictable output, and no secret values.

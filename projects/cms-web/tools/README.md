# Project tools

`check.ts` is the deterministic check entrypoint. `../_config/project.json` declares its command. From the repository root:

```sh
node tools/src/cli.ts project check --project cms-web
```

Install dependencies here with `npm ci --legacy-peer-deps`. The declared project check runs TypeScript checking. `npm run build` is the full build and may require development service settings. The imported `lint` script uses `next lint`; verify it against the installed Next.js version before claiming lint coverage.

Keep project-specific checks and transformations here. Shared validation and process launching belong in root `tools/`. New tools use typed arguments and `shell: false`, predictable output, and no secret values.

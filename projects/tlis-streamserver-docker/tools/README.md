# Project tools

`check.ts` is the deterministic check entrypoint. `../_config/project.json` declares its command. From the repository root:

```sh
node tools/src/cli.ts project check --project tlis-streamserver-docker
```

The declared project check runs `docker compose config --quiet` from this folder. It validates configuration without starting containers or printing expanded secret values. A real audio-path test requires Docker, audio files, and the intended stream environment.

Keep project-specific checks and transformations here. Shared validation and process launching belong in root `tools/`. New tools use typed arguments and `shell: false`, predictable output, and no secret values.

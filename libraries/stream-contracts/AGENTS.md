# Shared stream contracts

This library owns the shared stream lifecycle contract consumed by the website and video service. Keep application episode models and private `stream_key` requirements in their consumers. Do not import application code into this library.

- `src/index.ts` is canonical source. `dist/` is generated. Consumer `vendor/*.tgz` files are versioned distributions, not editable source.
- Keep exported declarations compatible with both the video service's CommonJS/Node resolution and the website's ESNext/bundler resolution. Type-only consumer imports must not add runtime behavior.
- Use Node 24 for local scripts. After `npm ci`, run `npm run check` for typechecks, build, tests, and distribution parity checks.
- To release changed source or package documentation, follow `workflows/release/CONTEXT.md`. Bump the package version deliberately, run `npm run vendor:sync`, and validate both consumers. No registry publishing is configured.
- Reusable agent/external capabilities belong in `tools/`. Build, packaging, and verification mechanics belong in `scripts/`.

Read `CONTEXT.md` for routing. Load only the relevant stage and references, and keep working evidence under that stage's `output/<run-id>/`.

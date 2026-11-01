# Website development

Run from `projects/cms-web`:

```sh
npm ci --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Set development Directus and public URL values before loading data-backed pages. The website normally serves port 3000. Use development service credentials; the repository does not provision a Directus database.

The project check performs TypeScript validation. From the repository root:

```sh
npm run repo -- project check --project cms-web
```

For a full production build, run `npm run build` here with the required service/build configuration. That build may fetch data or assets. `npm run start` serves an existing build. The imported `lint` script invokes `next lint`; confirm support in the installed Next.js release before treating it as a working lint check.

Feature work starts from `dev` on a `feature/<name>` branch. Read `workflows/change/CONTEXT.md` for the local change contract and `workflows/service/CONTEXT.md` for service validation/operations. Numbered stage outputs are per run and may be reviewed before the next stage.

A contract library change also requires checks for its registered direct consumers. Root architecture/history checks validate repository structure and import integrity, not UI or Directus behavior. Record any missing service-dependent validation.

For image validation use this project as the Docker context. Website development and production deployment workflows remain manual and select `dev` and `main` respectively; see root deployment documentation.

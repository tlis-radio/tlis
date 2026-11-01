# Audio stack development

A Docker engine with Compose is required. From this project:

```sh
docker compose config --quiet
docker compose up --build
```

From the repository root the same configuration check is dispatched through the declared project script:

```sh
npm run repo -- project check --project tlis-streamserver-docker
```

The quiet check validates configuration without printing substituted credentials. It does not compile the Liquidsoap script, start containers, verify credentials, test source transitions, or prove that playback works.

Before a live check, review the environment values and port mappings. Visit Filebrowser on host port 8080, use the initial password printed by its container, and change it. Upload music only into the expected directories. Exercise studio input, fallback, scheduled audio, and replay recording against a development stream environment.

Use a named development Compose project to avoid mixing volumes with an existing instance. Do not delete volumes as a routine reset; fallback audio, replay recordings, and Filebrowser state persist there.

Agent work uses the local change workflow for code/configuration changes and the service workflow for validation or requested operations. Keep schedule examples and verification artifacts free of live credentials. Liquidsoap remains a domain-specific language; TypeScript scripts handle predictable checks and transformations around it.

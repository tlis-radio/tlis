# Choosing validation

Run checks appropriate to the changed behavior.

| Area | Check | Limit |
| --- | --- | --- |
| Repository scripts | Root `npm run check`, `npm test` | Not a live service test |
| Context/docs layout | `npm run verify:architecture` | Not proof of AI or runtime behavior |
| Imported history | `npm run verify:history` | Full history required |
| Website | Project typecheck/build | UI and Directus may need a live environment |
| Video | Project build | Does not run OBS, FFmpeg, or Directus |
| Audio | `docker compose config --quiet` | Does not start audio; do not print secrets |
| Bot | Project `npm run check` | Offline tests, no live registration/messages |
| Aspire | SDK restore, typecheck, tests, selected live checks | Audio/video need documented prerequisites |

Use `component check --component <name>` through the repository CLI after installing that project's prerequisites. Use `changes` to inspect committed impact and examine runtime interfaces too.

Check real consumers for integration changes. There are no current shared application packages or vendor synchronization steps. Record actual results and unavailable checks in the verification handoff.

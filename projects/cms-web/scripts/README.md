# cms-web maintenance scripts

`check.ts` executes the component's declared checks in `../_config/project.json` using the shared validated runner. Install the component's dependencies first; this script does not install packages or start services.

From the repository root, run `npm run repo -- component check --component cms-web`. External/MCP capability APIs belong in `../tools/` or the relevant workflow/stage's `tools/`; they are separate from maintenance scripts.

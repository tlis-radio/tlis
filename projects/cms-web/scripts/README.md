# cms-web maintenance scripts

`check.ts` executes the component's declared checks in `../_config/project.json` using the shared validated runner. Install the component's dependencies first; this script does not install packages or start services.

From the repository root, run `npm run repo -- component check --component cms-web`. These are callable repository helpers. The AI can use them through the harness terminal alongside configured host integrations.

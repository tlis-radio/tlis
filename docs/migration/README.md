# Fresh repository import

This repository was rebuilt on **2026-11-01** using `git-filter-repo`, with every application under `projects/`.

| Source | Default branch | Imported folder | Preserved commits | Archived refs |
| --- | --- | --- | ---: | ---: |
| [cms-web](https://github.com/tlis-radio/cms-web) | `main` | `projects/cms-web/` | 520 | 35 |
| [tlis-streamserver-docker](https://github.com/tlis-radio/tlis-streamserver-docker) | `main` | `projects/tlis-streamserver-docker/` | 36 | 4 |
| [videostream](https://github.com/tlis-radio/videostream) | `master` | `projects/videostream/` | 7 | 1 |

All **563 commits** reachable from the fresh mirrors were preserved. Fourteen named source branches and 26 historical PR heads became 40 archival refs. No source tags existed. A new TypeScript Discord bot is added at `projects/tlis-discord-bot/` in the monorepo's own history.

## History rewriting

Untouched mirrors and complete Git bundles were created outside the destination. A second, fresh mirror of each was rewritten with:

```sh
git filter-repo \
  --to-subdirectory-filter "projects/$PROJECT" \
  --tag-rename ":$PROJECT/" \
  --prune-empty never \
  --prune-degenerate never \
  --preserve-commit-hashes \
  --preserve-commit-encoding \
  --replace-refs delete-no-add
```

Named branches became `archive/<project>/branches/<original-branch>`. GitHub's historical `refs/pull/<n>/head` refs became `archive/<project>/pull/<n>/head`, since GitHub reserves the destination's own pull-ref namespace. Tags, had there been any, would have been prefixed `<project>/`.

New work starts on `feature/<name>` from `dev`, merges into `dev`, and is released into `main`. The initial import and agent architecture were assembled on `feature/agentic-monorepo`; this bootstrap follows the same integration flow. Archived branches contain individual source projects and are references, rather than bases for new features.

The three default histories were merged without squashing or rebasing using `--no-ff --allow-unrelated-histories`. The import anchor is `560deadd227dcce1baef9f662658d4dcdb8d890d`. Each project subtree at that anchor exactly equals the original default-branch tree object.

## Records and verification

`manifest.json` records source refs, original and rewritten targets, options, integration commits, and original default tree IDs. Each `<project>.commit-map` is the mapping emitted by `git-filter-repo`. Each `<project>.commits.json` records original tree IDs, ordered parent IDs, and SHA-256 fingerprints of original author/committer headers, timestamps, encoding, and complete commit messages.

```sh
npm ci
npm run verify:history
git fsck --full --no-reflogs
```

The TypeScript verifier checks every imported commit and its mapped parents, complete metadata/message fingerprint, exact tree placement under `projects/<name>`, retained refs, reachability, and integration. It checks immutable imported commits and the anchor, so future feature development can change application files. A shallow or single-branch clone needs all history fetched first:

```sh
git fetch origin '+refs/heads/*:refs/remotes/origin/*' --tags
```

To trace an old commit, look up its SHA in that source's `.commit-map` and inspect the new SHA. File history follows the new path, for example `git log --follow -- projects/videostream/src/index.ts`.

## Changes after the import anchor

- The three original automatic workflow YAML files were removed from the project working trees and preserved verbatim as non-executable `.txt` references in `legacy-workflows/`. Root replacements preserve their deployment behavior with `workflow_dispatch` as the only active trigger. Optional folder-and-branch triggers are fully commented.
- Root and project agent guidance, context routing, scoped workflows/prompts, deterministic tools, and shared references were added separately from imported history.
- `projects/cms-web/tsconfig.json` excludes its new `tools/` directory so repository maintenance code is checked by the root TypeScript configuration rather than Next.js. Its dependencies and lockfile are retained.
- The Discord bot is a new independent TypeScript project. It does not require or register live Discord/calendar credentials for offline checks.

The source repositories were not rewritten, deleted, archived, or reconfigured. Their settings and workflows are separate from this repository. Coordinate any operational cutover separately; see [deployment.md](../deployment.md).

Path rewriting necessarily changes commit IDs. Original identity, timestamps, messages (including references to old SHA strings), parent topology, file contents, and modes are preserved in the imported commits. Cryptographic signatures cannot remain valid after rewriting; original sources and bundles retain the original objects.

GitHub issues, PR conversations/reviews, releases/assets, stars, secrets, package access, environments, collaborators, branch settings, and previous Actions runs are not Git history and were not copied. Preserving PR commits does not recreate GitHub PR records. The source streamserver already tracked `.env` and `auth.env`; those existing files/history were preserved, and new ignore rules do not untrack them.

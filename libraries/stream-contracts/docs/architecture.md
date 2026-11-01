# Architecture

This package holds the exact lifecycle vocabulary and shared stream-record shape already present in the website and video service. It has no application dependencies and no external calls.

```text
libraries/stream-contracts/src/
  -> build + npm pack
  -> projects/cms-web/vendor/<version>.tgz
  -> projects/videostream/vendor/<version>.tgz
```

The website imports the shared record with its own `Episode` relation type. The video service supplies its smaller `DirectusEpisode` relation. Each keeps its existing exported DTO names and private-key optionality. Sharing the generic lifecycle does not make a private DTO safe to return publicly; response mapping remains the application's responsibility.

The package emits CommonJS JavaScript and `.d.ts` declarations. The video service retains CommonJS with its existing Node resolution, and the website retains ESNext with bundler resolution. Their current imports are type-only and erase during compilation. Compatibility tests compile representative public/private DTOs in both modes.

Each project retains its package and lockfile. A dependency such as `file:../../libraries/stream-contracts` would escape a project-only Docker context. Instead, each project uses a versioned local tarball under `vendor/`, copied into the image before `npm ci`. The tarballs are generated distributions; the library source and release scripts own them.

`scripts/sync-consumers.ts --check` rebuilds and repacks canonical source in a temporary directory, compares archive bytes for both consumers, and verifies package declarations, package versions, resolved paths, and lockfile SHA-512 integrity. `--write` updates those distributions explicitly using local/offline npm resolution. The package is private and no external publish command is part of the workflow.

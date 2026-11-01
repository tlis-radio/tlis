# Development

Keep shared contracts in this component and application-specific fields in their consumers. Use `workflows/change/CONTEXT.md` for a substantial API edit and `workflows/release/CONTEXT.md` when distributing accepted source or packaged documentation.

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run vendor:check
```

`npm run check` runs the same sequence through `scripts/check.ts`. Source and maintenance scripts are typechecked separately. Tests cover the exact lifecycle values, frozen runtime vocabulary, required/optional private-key consumer distinctions, and both CommonJS/Node and ESNext/bundler resolution. The parity check builds canonical source again and compares the two consumer distributions and locks.

The package has no runtime service dependency. The two actual consumer checks are still needed after release synchronization; a library compatibility fixture does not replace either application's build.

Generated `dist/` and workflow outputs stay local. The versioned consumer archives are committed distribution artifacts. See [release](release.md) for updating them without changing project Docker contexts or combining lockfiles.

Maintenance mechanics live in `scripts/`. The `tools/` folder is reserved for actual reusable agent or external-service capabilities if one is later needed; no connector is configured for this contract-only component.

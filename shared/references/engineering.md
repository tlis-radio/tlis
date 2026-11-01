# Shared engineering conventions

All deployable services live under `projects/`. A project owns its source, dependency lock, Docker context, local context, service workflow, prompts, and check entrypoint. Keep cross-project mechanics in root TypeScript tools; keep service decisions in the project.

Use the existing runtime and lockfile for each imported project. Do not introduce a root npm workspace that silently changes installation or dependency resolution for all projects.

New deterministic tooling uses TypeScript with erasable syntax supported by Node 24. Validate structured inputs, return structured results, and pass process arguments as arrays with `shell: false`. Keep operation policy separate from service adapters so tests can inject a fake implementation. Prefer small operations that can be rerun intentionally.

Keep behavior changes and unrelated dependency upgrades separate. For a cross-service interface change, update the producer, consumer, and relevant reference contract together, then validate both sides.

Project services require environment-specific credentials. Shared defaults must not contain live credentials. Public archive identifiers must never expose a private OBS stream key.

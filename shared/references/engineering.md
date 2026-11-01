# Shared engineering conventions

Deployable services belong in `projects/`; reusable runtime code belongs in `libraries/`. Each component owns its source, docs, configuration, workflow/stage contracts, prompts, external-capability declarations, and deterministic scripts.

`tools/` means external tools: MCP/API capability definitions, adapters, and scoped usage contracts. `scripts/` means predictable execution: checks, transforms, file operations, packaging, process launching, and validated provider calls. Keep both when useful; do not rename ordinary checks into external capabilities.

Each agent workflow and numbered stage has `CONTEXT.md`, `prompt.md`, and `tools/`. Define only the capabilities needed at that scope. Use `.gitkeep` when no external tool applies. A capability's presence never configures a provider or grants permission.

Use the component's existing runtime and lockfile. Shared libraries have a versioned package and explicit registered consumers. Preserve independent Docker contexts and locks; validate canonical packaging and all declared direct consumers when a library changes.

New deterministic scripts use TypeScript supported by Node 24. Validate structured inputs and pass process arguments as arrays with `shell: false`. Keep network/time/storage dependencies injectable for meaningful tests. An agent chooses the action; a script carries out its mechanical part.

Keep unrelated dependency upgrades separate. Update a producer, consumer, and their documented contract together when changing a shared interface. Keep private keys out of public DTOs, logs, artifacts, and images.

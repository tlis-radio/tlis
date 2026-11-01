# Engineering conventions

Keep applications in `projects/` and reference material close to the source. Reserve `libraries/` for meaningful reuse; small local types do not need a package.

The human supplies a normal request. The AI selects context, plans when useful, and writes task-specific prompts only when delegating. Stage CONTEXT.md files contain its instructions.

Use actual tools: harness facilities, configured MCP connections, and existing scripts. Do not duplicate the harness with a custom agent or generic tool framework.

Keep locks and Docker contexts independent. Validate changed producers and real consumers. Keep unrelated dependency upgrades separate.

Scripts should perform concrete work with explicit inputs and process argument arrays. Use meaningful tests for changed behavior. Keep private keys out of public DTOs, logs, artifacts, and images.

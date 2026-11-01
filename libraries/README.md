# Shared code, when useful

This directory is reserved for future shared libraries and is intentionally empty.

Keep small interfaces, enums, and project-specific models next to their consumers. A separate package needs a concrete benefit, such as substantial reused behavior or an independently maintained boundary. A few matching lines are not enough.

When a real library is needed, use `libraries/<name>/`, document its API and consumers, and register the dependency in `_config/projects.json`. Give it useful local context and verification. Choose packaging for those actual consumers rather than adding distribution machinery in advance.

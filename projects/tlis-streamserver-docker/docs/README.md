# Audio stack documentation

- [Architecture](architecture.md): services, source selection, and persistent audio.
- [API and service contracts](api.md): stream mounts, ingest ports, and schedule data.
- [Configuration](configuration.md): environment names and source limitations.
- [Development](development.md): validate and run without changing volume identity.

Use [project routing](../CONTEXT.md) for agent tasks. There is no custom application HTTP API; Icecast and Filebrowser expose their own interfaces, and JSON/configuration files define the local contracts.

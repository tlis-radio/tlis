# Documentation index

## Shared references

- [Agent/workflow architecture](architecture.md): context layers, workflow instructions, harness tools, and repository scripts.
- [Development](development.md): branches, workflow selection, libraries, and consumer checks.
- [Deployment](deployment.md): manual Actions, environments, and cutover.
- [Migration](migration/README.md): immutable source-history records.

## Projects

| Component | Documentation | Primary interface |
| --- | --- | --- |
| [Website](../projects/cms-web/) | [Docs index](../projects/cms-web/docs/README.md) | [HTTP and Directus contracts](../projects/cms-web/docs/api.md) |
| [Audio stack](../projects/tlis-streamserver-docker/) | [Docs index](../projects/tlis-streamserver-docker/docs/README.md) | [Streams, ingest, and schedule contracts](../projects/tlis-streamserver-docker/docs/api.md) |
| [Video service](../projects/videostream/) | [Docs index](../projects/videostream/docs/README.md) | [RTMP, media, and Directus contracts](../projects/videostream/docs/api.md) |
| [Discord bot](../projects/tlis-discord-bot/) | [Docs index](../projects/tlis-discord-bot/docs/README.md) | [Health and slash-command contracts](../projects/tlis-discord-bot/docs/api.md) |
| [Aspire devhost](../projects/tlis-devhost/) | [Docs index](../projects/tlis-devhost/docs/README.md) | [Local orchestration contracts](../projects/tlis-devhost/docs/api.md) |

Every existing service has local architecture, API/service-contract, configuration, and development references. The devhost documents its local orchestration interface; it is not a public application API.

## Libraries

[The shared library area](../libraries/README.md) is reserved for meaningful reuse. No shared application library is currently extracted; the small stream types remain in their projects.

Project-specific docs stay with code. Root docs describe cross-component conventions. A component without a custom HTTP API documents its actual protocol or configuration contracts rather than inventing endpoints.

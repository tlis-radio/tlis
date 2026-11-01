# CLI and topology contracts

This project exposes a local orchestration interface, not a public HTTP API.

| Command | Contract |
| --- | --- |
| `npm run restore` | Ask Aspire 13.6.0 to restore packages and generate `.aspire/modules/` |
| `npm run dev` | Run this AppHost through the configured Aspire executable |
| `npm run stop` | Stop this AppHost through Aspire |
| `npm run plan` | Print the selected resource plan without starting services or exposing tokens |
| `npm run check` | Typecheck against the generated SDK and run the offline topology tests |

`scripts/aspire.ts` accepts only `restore`, `run`, and `stop` subcommands, fixes `--apphost apphost.mts`, and forwards additional explicit Aspire options. It uses argument arrays rather than shell-built commands.

| Resource | Local endpoint | Enabled |
| --- | --- | --- |
| `directus` | `http://localhost:8055/server/health` by default | External reference |
| `cms-web` | `http://localhost:3000` | Default |
| `tlis-discord-bot` | `http://localhost:3002/health` | Default, Discord disabled |
| `icecast` | `http://localhost:8000/status-json.xsl` | Audio opt-in |
| `liquidsoap` | Harbor input on `8100` | Audio opt-in |
| `music-filebrowser` | `http://localhost:8080` | Audio opt-in |
| `videostream` | HTTP media on `8001`; RTMP on `1935` | Video opt-in |
| Aspire dashboard | Configured HTTP port `15888` | CLI startup |

Directus must implement `/server/health` and the collections/access policies expected by the applications. The video service retains its ingest, archive, and private-key contracts. The audio service retains its Icecast mounts and schedule semantics. Use their local API docs when testing those interfaces.

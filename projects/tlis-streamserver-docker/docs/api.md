# Audio service contracts

This project has no custom REST server or OpenAPI document. Its public interfaces are the configured services and source files below.

| Interface | Current contract |
| --- | --- |
| Icecast host port 8000 | Distribution server; configured primary mount `/tlis.mp3` |
| Liquidsoap host port 8100 | Studio harbor input using the configured `studio.mp3` mount and `HARBOR_SOURCE_PASSWORD` |
| Filebrowser host port 8080 | Filebrowser container port 80; manages fallback files |
| Icecast status | Standard `/status-json.xsl` metadata used by clients such as the website |
| Icecast monitor outputs | `/tlis_unprocessed.mp3` and `/studio.mp3` as published by Liquidsoap |
| Schedule file | `/music/planovane_relacie/scheduled.json` inside Liquidsoap |

The schedule is a JSON array:

```json
[
  {
    "date_times": ["2026-11-02T10:30", "2026-11-03T10:30"],
    "audio": "show.mp3"
  }
]
```

`audio` names a file under `/music/planovane_relacie/`. Each `date_times` entry is a minute-resolution local date-time string without an offset. The script compares it with the container clock; agree on timezone explicitly and avoid assuming UTC. Multiple times may reference the same file.

Keep `jingles/`, `00h-06h/`, `06h-12h/`, `12h-18h/`, `18h-24h/`, and `planovane_relacie/` under the shared music root. Empty music folders can lead to the built-in tone/noise fallback.

Configuration source of truth: `compose.yaml`, `icecast/icecast.xml`, `icecast/start.sh`, and `liquidsoap/tlis-station.liq`. Port declarations in Icecast XML do not automatically publish additional host ports through Compose.

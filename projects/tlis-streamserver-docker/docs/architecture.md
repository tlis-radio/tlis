# Audio stack architecture

`compose.yaml` defines three services. Icecast distributes streams. Liquidsoap generates and selects source audio. Filebrowser manages files in the shared `fallback-music` volume.

Liquidsoap listens for studio input on its harbor port 8100. It chooses studio audio or fallback rotation with transitions, then applies processing for the primary `tlis.mp3` output. It also publishes `tlis_unprocessed.mp3` and a lower-bitrate `studio.mp3` monitor to Icecast. The Icecast configuration separately declares fallback mounts from `/tlis.mp3` to `/studio.mp3` to `/fallback.mp3`; inspect both source outputs and mount fallback configuration when changing failover.

The fallback volume is mounted at `/music` in Liquidsoap and `/srv` in Filebrowser. It contains jingles, four day-part music folders, and scheduled audio. A schedule queue has priority over fallback rotation. The script checks the schedule file every 60 seconds using minute-formatted local timestamps.

The `replay` volume stores processed and raw replay files. Filebrowser has separate database and configuration volumes. Compose project naming affects all named volumes; preserve the deployed project name during checkout/path changes.

Icecast's start script substitutes selected environment variables into XML before launch. Liquidsoap still contains some literal configuration, including a source-password assignment marked for environment conversion. The repository's TypeScript maintenance checks validate Compose structure; they do not replace the Liquidsoap/Icecast configuration or validate live audio quality.

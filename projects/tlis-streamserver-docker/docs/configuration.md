# Audio configuration

Compose passes `auth.env` and `.env` to Icecast and Liquidsoap. Both were tracked in the imported source history. Review local values and keep new credentials out of commits; an ignore rule does not remove tracked history.

`icecast/start.sh` accepts these substitution variables:

- `ICECAST_SOURCE_PASSWORD`, `ICECAST_RELAY_PASSWORD`, `ICECAST_ADMIN_PASSWORD`, `ICECAST_ADMIN_USERNAME`.
- `ICECAST_ADMIN_EMAIL`, `ICECAST_LOCATION`, `ICECAST_HOSTNAME`.
- `ICECAST_MAX_CLIENTS`, `ICECAST_MAX_SOURCES`.

Liquidsoap reads `HARBOR_SOURCE_PASSWORD` for studio ingress. Other important settings are currently literal assignments near the top of `liquidsoap/tlis-station.liq`: Icecast host/port/mount, bitrate, harbor mount/port, replay path/retention, and the source password. The source-password assignment has an environment-conversion TODO; setting an Icecast variable alone does not automatically change that Liquidsoap assignment.

The Dockerfile creates the expected music folders and copies the initial schedule into the image. Existing named-volume contents can outlive the image and its initial files. Update the actual persistent schedule/music location when operating an existing deployment.

Published host ports are 8000, 8100, and 8080. Videostream also defaults to host port 8000, so colocated local operation needs distinct mappings. Preserve the Compose project name to reuse the same named music, replay, and Filebrowser volumes.

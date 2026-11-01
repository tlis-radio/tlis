# Tlis StreamServer: Docker Edition

## Project references

[Documentation index](docs/README.md) routes to architecture, API/service contracts, configuration, and development. Agent task routing is in [CONTEXT.md](CONTEXT.md); deterministic maintenance programs live in `scripts/`, while workflow/stage `tools/` directories describe external capabilities.

This repository contains the TLIS streamserver in the form of Docker microservices. It is composed of the following containers:

1. Icecast (audio stream server)
2. Liquidsoap (fallback stream generator)
3. Filebrowser (for managing fallback audio files)

## Setup guide

Start the server using `docker compose up`.

The Icecast web interface is exposed on host port 8000. On port 8080, you will find a simple web-based fileserver which you can use to upload music and jingles for the fallback stream.

First, it is **necessary** to open the fileserver web interface, login as `admin` with the `password` generated and printed to the CLI by the filebrowser conteiner, and change the default admin password. It is also recommended to create a non-admin user, which should then be used to manage the audio files.

**NOTE: Do not change the folder structure!** Only upload/modify/delete music files in the existing directories. There is a single directory for jingles and 4 directories for different time segments of the day and 1 directory for specific audio files that are scheduled.

**NOTE:** Until you upload some music files, the fallback stream will be up but you will only hear a test tone and white noise.

**Note:** All scheduled `date_times` must use the ISO-like format:

`yyyy-mm-ddThh:mm`

You can schedule the **same audio file multiple times** by including multiple date/time values in the `date_times` array of a single entry. There is no need to create separate objects for the same audio.

 *example:*
 ```json
 [
   {
     "date_times": [
       "2026-07-08T10:30",
       "2026-07-08T22:30"
     ],
     "audio": "A.mp3"
   },
   {
     "date_times": [
       "2026-07-09T19:00"
     ],
     "audio": "B.mp3"
   }
 ]
 ```

## Exposed ports

- 8000: icecast web interface, also used for publishing audio (streaming from studio)
- 8080: filebrowser

## Notes

- `fallback-music` volume is shared between liquidsoap and filebrowser

# TODO

- [ ] explore better ways to manage icecast passwords in this project
- [ ] idea for a v2: for switching between studio and fallback, use the liquidsoap script. This should result in smoother changeovers, also there would always be exactly 1 public-facing active icecast mountpoint. This would also simplify listener count logging.
    - current icecast mountpoint order: tlis > studio > fallback
    - proposed mountpoint order: tlis > mix > live > studio
        - liquidsoap takes live and studio as inputs, generates fallback and outputs to mix. If liquidsoap (mix) fails, icecast will automatically switch to live or studio, if they're up.
 

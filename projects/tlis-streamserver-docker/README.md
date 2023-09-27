# Tlis StreamServer: Docker Edition

This repository contains the TLIS streamserver in the form of Docker microservices. It is composed of the following containers:

1. Icecast (audio stream server)
2. Liquidsoap (fallback stream generator)
3. Filebrowser (for managing fallback audio files)

## Setup guide

Start the server using `docker compose up`.

The Icecast web interface is exposed on host port 8000. On port 8080, you will find a simple web-based fileserver which you can use to upload music and jingles for the fallback stream.

First, it is **necessary** to open the fileserver web interface, login as `admin:admin` and change the default admin password. It is also recommended to create a non-admin user, which should then be used to manage the audio files.

**NOTE: Do not change the folder structure!** Only upload/modify/delete music files in the existing directories. There is a single directory for jingles and 4 directories for different time segments of the day.

**NOTE:** Until you upload some music files, the fallback stream will be up but you will only hear a test tone and white noise.

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
        - liquidsoap takes live and studio as inputs, 
 

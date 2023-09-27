#!/usr/bin/liquidsoap

#output to stdout for debug purposes
set("log.stdout", true)

#disable telnet requests
set("server.telnet", false)

#playlist definitions
jingles = playlist(mode = "random",reload = 300, reload_mode = "seconds", "/music/jingles/")

play0006 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "/music/00h-06h")
play0612 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "/music/06h-12h")
play1218 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "/music/12h-18h")
play1824 = playlist(mode = "randomize", reload = 1800, reload_mode = "seconds", "/music/18h-24h")


#select tracks from playlists based on time of day
radio = switch([
        ({ 0h-6h }, play0006),
        ({ 6h-12h }, play0612),
        ({ 12h-18h }, play1218),
        ({ 18h-0h }, play1824)])

#add jingles
radio = rotate(weights=[1,3],[jingles, radio])

#compress and normalize
radio = nrj(radio)

#stream silence if audio sources fail
outstream = mksafe(radio)

#stream to icecast server
output.icecast(%mp3(bitrate=192), host="icecast", port=8000, password=getenv("ICECAST_SOURCE_PASSWORD"), mount="fallback.mp3", outstream)
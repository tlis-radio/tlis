#!/bin/sh

mkdir -p \
    /music/jingles \
    /music/00h-06h \
    /music/06h-12h \
    /music/12h-18h \
    /music/18h-24h

chmod -R a+r /music*

su -c "liquidsoap /fallback-stream.liq" walkman
FROM savonet/liquidsoap:v2.4.5

USER root

RUN mkdir /music \
    /music/jingles \
    /music/00h-06h \
    /music/06h-12h \
    /music/12h-18h \
    /music/18h-24h \
    /music/planovane_relacie

RUN chmod 2777 /music \
    /music/jingles \
    /music/00h-06h \
    /music/06h-12h \
    /music/12h-18h \
    /music/18h-24h \
    /music/planovane_relacie

COPY scheduled.json /music/planovane_relacie/

RUN chmod -R a+r /music*

RUN mkdir /replay
RUN chmod -R a+rw /replay*

RUN groupadd --gid 1010 walkman && useradd --gid 1010 walkman
RUN chown -R walkman:walkman /music*

COPY . /
RUN chmod 444 /tlis-station.liq

USER walkman
CMD ["liquidsoap", "./tlis-station.liq"]
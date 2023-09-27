FROM ubuntu:22.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean
RUN apt-get install liquidsoap -y

RUN mkdir /music \
    /music/jingles \
    /music/00h-06h \
    /music/06h-12h \
    /music/12h-18h \
    /music/18h-24h

RUN chmod 777 /music \
    /music/jingles \
    /music/00h-06h \
    /music/06h-12h \
    /music/12h-18h \
    /music/18h-24h

RUN chmod -R a+r /music*

RUN groupadd --gid 1010 walkman && useradd --gid 1010 walkman
RUN chown -R walkman:walkman /music*

COPY . /
RUN chmod 444 /fallback-stream.liq
RUN chmod 777 /start.sh

USER walkman
CMD liquidsoap ./fallback-stream.liq
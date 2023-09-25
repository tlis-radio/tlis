FROM alpine:3.18.3

RUN apk add mailcap icecast xmlstarlet

COPY icecast.xml /etc/
USER icecast
CMD icecast -c /etc/icecast.xml
# CMD ls -la && ls -la ./log
EXPOSE 8000
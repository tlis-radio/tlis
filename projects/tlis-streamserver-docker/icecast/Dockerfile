FROM alpine:3.18.3

RUN apk add mailcap icecast xmlstarlet

COPY icecast.xml /etc/
RUN chmod 666 /etc/icecast.xml
COPY start.sh /
RUN chmod 777 /start.sh

USER icecast
# CMD icecast -c /etc/icecast.xml
# CMD ls -la && ls -la ./log
CMD /start.sh
EXPOSE 8000
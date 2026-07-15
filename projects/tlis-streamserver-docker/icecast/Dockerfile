FROM alpine:3.24

RUN apk add mailcap icecast xmlstarlet

COPY icecast.xml /icecast.xml
RUN chown icecast:icecast /icecast.xml && chmod 600 /icecast.xml

COPY ./start.sh /start.sh
RUN chown icecast:icecast /start.sh && chmod 700 /start.sh

USER icecast
# CMD icecast -c /etc/icecast.xml
# CMD ls -la && ls -la ./log
# CMD ["ls", "-la", "/"]
CMD ["/bin/sh", "/start.sh"]
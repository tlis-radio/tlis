FROM savonet/liquidsoap:v2.4.5

USER root

RUN groupadd --gid 1010 walkman && useradd --uid 1010 --gid 1010 walkman

RUN mkdir /music && chown 1010:1010 /music && chmod 2777 /music 
RUN mkdir /replay && chown 1010:1010 /replay && chmod -R a+rw /replay*

COPY scheduled_template.json start.sh tlis-station.liq /
RUN chown 1010:1010 /scheduled_template.json /start.sh /tlis-station.liq
RUN chmod 440 /scheduled_template.json /tlis-station.liq
RUN chmod 770 /start.sh

# CMD ["/bin/sh", "/start.sh"]
# CMD ["/start.sh"]
ENTRYPOINT [ "/start.sh" ]
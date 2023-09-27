FROM ubuntu:22.04

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install liquidsoap -y

RUN useradd walkman
COPY . /
RUN chmod 444 /fallback-stream.liq
RUN chmod 777 /start.sh

# USER walkman

CMD /start.sh
# CMD liquidsoap /fallback-stream.liq
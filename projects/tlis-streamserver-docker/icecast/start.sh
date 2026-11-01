#!/bin/sh

if [ -n "$ICECAST_SOURCE_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/source-password --value $ICECAST_SOURCE_PASSWORD /etc/icecast.xml
fi
if [ -n "$ICECAST_RELAY_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/relay-password --value $ICECAST_RELAY_PASSWORD /etc/icecast.xml
fi
if [ -n "$ICECAST_ADMIN_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/admin-password --value $ICECAST_ADMIN_PASSWORD /etc/icecast.xml
fi
if [ -n "$ICECAST_ADMIN_USERNAME" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/admin-user --value $ICECAST_ADMIN_USERNAME /etc/icecast.xml
fi
if [ -n "$ICECAST_ADMIN_EMAIL" ]; then
    xmlstarlet edit --inplace --update /icecast/admin --value $ICECAST_ADMIN_EMAIL /etc/icecast.xml
fi
if [ -n "$ICECAST_LOCATION" ]; then
    xmlstarlet edit --inplace --update /icecast/location --value $ICECAST_LOCATION /etc/icecast.xml
fi
if [ -n "$ICECAST_HOSTNAME" ]; then
    xmlstarlet edit --inplace --update /icecast/hostname --value $ICECAST_HOSTNAME /etc/icecast.xml
fi
if [ -n "$ICECAST_MAX_CLIENTS" ]; then
    xmlstarlet edit --inplace --update /icecast/limits/clients --value $ICECAST_MAX_CLIENTS /etc/icecast.xml
fi
if [ -n "$ICECAST_MAX_SOURCES" ]; then
    xmlstarlet edit --inplace --update /icecast/limits/sources --value $ICECAST_MAX_SOURCES /etc/icecast.xml
fi

icecast -c /etc/icecast.xml
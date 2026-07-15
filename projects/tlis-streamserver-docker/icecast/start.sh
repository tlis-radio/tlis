#!/bin/sh

if [ -n "$ICECAST_SOURCE_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/source-password --value $ICECAST_SOURCE_PASSWORD /icecast.xml
fi
if [ -n "$ICECAST_RELAY_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/relay-password --value $ICECAST_RELAY_PASSWORD /icecast.xml
fi
if [ -n "$ICECAST_ADMIN_PASSWORD" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/admin-password --value $ICECAST_ADMIN_PASSWORD /icecast.xml
fi
if [ -n "$ICECAST_ADMIN_USERNAME" ]; then
    xmlstarlet edit --inplace --update /icecast/authentication/admin-user --value $ICECAST_ADMIN_USERNAME /icecast.xml
fi
if [ -n "$ICECAST_ADMIN_EMAIL" ]; then
    xmlstarlet edit --inplace --update /icecast/admin --value $ICECAST_ADMIN_EMAIL /icecast.xml
fi
if [ -n "$ICECAST_LOCATION" ]; then
    xmlstarlet edit --inplace --update /icecast/location --value $ICECAST_LOCATION /icecast.xml
fi
if [ -n "$ICECAST_HOSTNAME" ]; then
    xmlstarlet edit --inplace --update /icecast/hostname --value $ICECAST_HOSTNAME /icecast.xml
fi
if [ -n "$ICECAST_MAX_CLIENTS" ]; then
    xmlstarlet edit --inplace --update /icecast/limits/clients --value $ICECAST_MAX_CLIENTS /icecast.xml
fi
if [ -n "$ICECAST_MAX_SOURCES" ]; then
    xmlstarlet edit --inplace --update /icecast/limits/sources --value $ICECAST_MAX_SOURCES /icecast.xml
fi

icecast -c /icecast.xml
#!/bin/sh

sudo certbot certonly \
    --manual \
    --domain localhost.gojabako.zone \
    --preferred-chain "ISRG Root X1" \
    --preferred-challenges dns

sudo cp -r /etc/letsencrypt/live/localhost.gojabako.zone certificates
sudo chmod +r certificates/localhost.gojabako.zone/*

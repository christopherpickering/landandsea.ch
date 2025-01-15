---
title: How To Run Immich on a home server behind a public vps with wg-easy
description: Running a home photo backup, Immich, with docker-compose and tunneled back from a public vps with wireguard (wg-easy)
date: 2024-09-05
tags:
  - immich
  - docker
  - vpn
---

This setup allows you to have your picture library stored at home on a big, cheap ssd. My home internet was through LTE/5G and could not use a dynamic dns to get into the home network. I'm running a public vps with nginx and wireguard (wg-easy) and fowarding ports to my home server through the vpn.

# VSP

## Setup wg-easy and nginx

Add something like the following to your `docker-compose.yml`:

Note the ip address and port in the WG_PRE_UP and DOWN sections - this will be your wireguard client that we setup later. You'll probably need to change the nginx section.

```yml
services:
  nginx:
    image: nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - '80:80'
      - '443:443'
    depends_on:
      - wg-easy
    networks:
      my-network:
        aliases:
          - nginx
  wg-easy:
    environment:
      - LANG=en
      - WG_HOST=vpn.example.com
      - PASSWORD=123456
      - WG_DEFAULT_DNS=185.228.168.125, 185.228.169.125
      - UI_TRAFFIC_STATS=true
      - WG_DEFAULT_DNS=${IPV4_NETWORK:-172.22.1}.111
      - WG_PERSISTENT_KEEPALIVE=25
      - WG_PRE_UP=iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE; iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 2283 -j DNAT --to-destination 10.8.0.6:2283;
      - WG_PRE_DOWN=iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE; iptables -D PREROUTING -t  nat -i eth0 -p tcp --dport 2283 -j DNAT --to-destination 10.8.0.6:2283;
    image: ghcr.io/wg-easy/wg-easy
    container_name: wg-easy
    volumes:
      - ./data/wg-easy:/etc/wireguard
    ports:
      - '51820:51820/udp'
      - '51821:51821/tcp'
    expose:
      - 2283
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    sysctls:
      - net.ipv4.ip_forward=1
      - net.ipv4.conf.all.src_valid_mark=1
    networks:
      my-network:
        ipv4_address: ${IPV4_NETWORK:-172.22.1}.112
        aliases:
          - wireguard
networks:
  my-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: ${IPV4_NETWORK:-172.22.1}.0/24
```

Add the `nginx.conf`, changing the server name, your cert location, etc. The first block is the wg-easy's ui, and the second block is for our port forward.

```
events { worker_connections 1024; }

http {
  server {
      ssl_certificate /etc/ssl/mail/cert.pem;
      ssl_certificate_key /etc/ssl/mail/key.pem;
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_prefer_server_ciphers on;
      ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
      ssl_ecdh_curve X25519:X448:secp384r1:secp256k1;
      ssl_session_cache shared:SSL:50m;
      ssl_session_timeout 1d;
      ssl_session_tickets off;
      include /etc/nginx/conf.d/listen_plain.active;
      include /etc/nginx/conf.d/listen_ssl.active;
      server_name vpn.example.com;

      server_tokens off;

      location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        rewrite /.well-known/acme-challenge/(.*) /$1 break;
        root /web/.well-known/acme-challenge/;
      }

      if ($scheme = http) {
        return 301 https://$host$request_uri;
      }

      location / {
          client_max_body_size 512M;
          proxy_pass http://wireguard:51821/;
          proxy_set_header Connection $http_connection;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  server {
    ssl_certificate /etc/ssl/mail/cert.pem;
    ssl_certificate_key /etc/ssl/mail/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_ecdh_curve X25519:X448:secp384r1:secp256k1;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    include /etc/nginx/conf.d/listen_plain.active;
    include /etc/nginx/conf.d/listen_ssl.active;
    server_name pics.example.com;

    server_tokens off;

    location ^~ /.well-known/acme-challenge/ {
      default_type "text/plain";
      rewrite /.well-known/acme-challenge/(.*) /$1 break;
      root /web/.well-known/acme-challenge/;
    }

    if ($scheme = http) {
      return 301 https://$host$request_uri;
    }

    location / {
        client_max_body_size 512M;
        proxy_pass http://wireguard:2283/;
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
}
```

Thats it for now.

# Home Server Setup

## Getting certificates on the home network

Since we are using the same domain on the intranet and public internet a different method of getting certbot certs is needed. We'll be using cloudflare tokens + dns records here, as http method is pointing to our public vps.

1. Install certbot and plugin for cloudflare:

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo snap set certbot trust-plugin-with-root=ok
sudo snap install certbot-dns-cloudflare
```

Next, get an api key from cloudflare and add it to a secrets file.

```bash
nano ~/.secrets/certbot/cloudflare.ini

# add in the following text:

# Cloudflare API token used by Certbot
dns_cloudflare_api_token = <api token>
```

Finally, request the cert with certbot

```bash
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini -d pics.example.com
```

## Setup Immich with nginx

Follow the normal install for Immich (https://immich.app).

Add in a `nginx.conf` file, using your servers host IP, and put in a dns (you can map to this from your home pi-hole in the dns/cname section so while at home you use local internet to load pics, and while not home it uses your vps):

```
events { worker_connections 1024; }

http {

  server {
      listen 80
      listen 443 ssl;
      server_name pics.example.com;

      ssl_certificate /etc/nginx/certs/live/pics.example.com/fullchain.pem;
      ssl_certificate_key /etc/nginx/certs/live/pics.example.com/privkey.pem;

      # allow large file uploads
      client_max_body_size 50000M;

      # Set headers
      proxy_set_header Host              $http_host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      # enable websockets: http://nginx.org/en/docs/http/websocket.html
      proxy_http_version 1.1;
      proxy_set_header   Upgrade    $http_upgrade;
      proxy_set_header   Connection "upgrade";
      proxy_redirect     off;

      # set timeout
      proxy_read_timeout 600s;
      proxy_send_timeout 600s;
      send_timeout       600s;

      if ($scheme = http) {
        return 301 https://$host$request_uri;
      }

      location / {
          proxy_pass http://host-ip:2283;
      }
  }
}
```

Next, add another section for `nginx` to the `docker-compose.yml`:

```yml
nginx:
  image: nginx
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - /etc/letsencrypt/:/etc/nginx/certs
  ports:
    - '80:80'
    - '443:443'
  depends_on:
    - immich-server
```

Start up again with `docker compose up -d`.

## Setup VPN

Install wireguard on your server:

```
sudo apt install wireguard
wg genkey | sudo tee /etc/wireguard/private.key
sudo chmod go= /etc/wireguard/private.key
sudo cat /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key
```

Edit the systctl file to enalbe ipv4 ip forward:

```bash
sudo nano /etc/sysctl.conf
# set this
net.ipv4.ip_forward=1

# save, then reload file:
sudo sysctl -p
```

From the website of your public vps vpn (https://vpn.example.com), you can add a client. Download the config file and copy it to `nano /etc/wireguard/wg0.conf` on your home server.

Hopefully it looks something like this:

```
[Interface]
Address = 10.8.0.6/24
PrivateKey = 123456
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o ens18 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o ens18 -j MASQUERADE

# Server
[Peer]
PublicKey = 123456
PresharedKey = 123456
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
Endpoint = vpn.example.com:51820
```

You can check the connection with ` sudo wg show`.
Next, turn on the vpn: `wg-quick up wg0`. If you go back to the web up of vpn.example.com, your client should show connected.

The vpn can be stopped with `wg-quick down wg0` and started with `wg-quick up wg0`.

To enable vpn connection on boot, stop the vnp with `wg-quick down wg0`, then add it to systemd: `sudo systemctl enable --now wg-quick@wg0`

Don't forget to go back to the docker-compose.yml file on your vps and update the client's ip address for the port forwarding :)

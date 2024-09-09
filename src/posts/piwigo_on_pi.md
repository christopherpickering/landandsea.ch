---
title: How To Run Piwigo on Raspberry Pi 2 W
description: Running a home photo backup, Piwigo, on Raspberry Pi 2 W with docker-compose.
date: 2024-9-5
tags:
  - Raspberry PI
  - docker
---

This tutorial is how I set up Piwigo on a Raspberry PI 2 W to replace Google photos and Apple photos after running out of free space. I set it up with a 4tb external hard drive, planning to add a second drive as a backup.

## Raspberry Pi 2 W

Setup a normal way, assuming hostname is pics.local.

Update the system

```sh
sudo apt update
sudo apt upgrade
sudo apt autoremove
```

## Format External Drive

1. Connect drive
2. Check the name with `sudo parted -l`. It will probably be `/dev/sda` or `/dev/sdb`

Assuming the name is `/dev/sda`

3. Erase it with `sudo shred -v /dev/sda` or `sudo dd if=/dev/zero of=/dev/sda status=progress`
4. Create partition map with `sudo parted /dev/sda mklabel gpt`
5. Create a partition with `sudo parted /dev/sda mkpart primary ext4 0% 100%`

6. Get the new partition name with `sudo parted -l`. Probably something like `/dev/sda1`
7. Format filesystem with `sudo mkfs.ext4 /dev/sda1`
8. Mount it

## Mount External Drive

```sh
sudo mkdir /external
sudo chown -R $USER:$USER /external
sudo chmod -R 744 /external

```

9. Set drive to auto mount on boot

```sh
sudo nano /etc/fstab

# add line to mount new drive
/dev/sda1 /external    ext4    defaults,nofail,noatime,rw,user        0       0

# reload
sudo systemctl daemon-reload

# test
sudo mount -a
```



## Add swap memory

1. Check current swap `swapon --show` or `free -h`
2. Create a new swapfile

```sh
sudo fallocate -l 4G /swap

# update permissions
sudo chmod 600 /swap

# make it swap
sudo mkswap /swap

# enable
sudo swapon /swap

# check
swapon --show

# enable after reboot
sudo nano /etc/fstab

# add
/swap swap swap defaults 0 0
```

## Install Docker and Docker Compose

```sh
curl -sSL https://get.docker.com/ | CHANNEL=stable sh
# might need to enable docker
systemctl enable --now docker

# and docker compose
sudo apt update
sudo apt install docker-compose-plugin
```

## Create docker compose for Piwigo

1. Change to the external storage `cd /external`
2. `nano docker-compose.yml`

```yaml
services:
  piwigo:
    image: lscr.io/linuxserver/piwigo:latest
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
    volumes:
      - ./piwigo/config:/config
      - ./piwigo/gallery:/gallery
    ports:
      - 80:80
      - 443:443
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: lscr.io/linuxserver/mariadb:latest
    restart: unless-stopped
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=mysql
    volumes:
      - ./mysql:/config

```

3. Start it up `sudo docker compose up`
4. If no problems, run it as background `sudo docker compose up -d`



## Setting up Piwigo

When accessing piwigo (http://pics.local) for the first time, you can set up the database connection with:

```
server: db
username: root
password: secret
database: mysql
```

## Updating

```sh
docker compose pull
docker compose down
docker compose up -d
```

## Logs

```sh
docker compose logs
```

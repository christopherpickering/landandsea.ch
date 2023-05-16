---
title: Introduction to Docker
description: List of basic docker commands I'd like to remember.
date: 2019-05-25
tags:
  - docker
---

<div class="rounded border p-4 bg-white/80">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

## Build an Image

```bash
# to build an image of the current directories docker file
docker build -t <name> .
```

## List Images

```bash
docker images
```

## Run Image

```bash
docker run <name>

# run with a user and tag
docker run -i -t -u 0 cp_test:latest
```

## Launch an Images Shell

```bash
# list running containers
docker ps

# connect to it
docker exec -it <running_cont_id> bash

# or just launch an ubuntu shell directly
docker run -i -t ubuntu /bin/bash
```

## Inspect Image

```bash
docker inspect <repo:tag or id>
```

## Clean Up

A few clean up commands:

```bash
# Remove everything
docker prune

# containers
docker rm $(docker ps -a -q)

# images
docker rmi $(docker images -q)

```

### Remove Images by Name

```bash
# get image id
docker images
# delete image
docker rmi -f <image id>
```

# Docker Composer

## Run a Docker Image

```bash
# add -d flag for daemon mode
docker-compose up
```

## What is Running

```bash
docker-compose ps
```

## Stop Running

```bash
docker-compose stop
```

---
title: Introduction to Docker
description: This is a post on My Blog about agile frameworks.
date: 2019-05-25
tags:
  - another tag
---

<div class="notification">
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
```

## Inspect Image

````bash
docker inspect <repo:tag or id>

## Clean Up

### Remove everything

```bash
docker prune
````

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

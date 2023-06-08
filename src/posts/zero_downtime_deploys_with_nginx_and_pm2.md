---
title: How to do zero downtime deploys with nginx and pm2.
description: Deploying node.js web applications from github to ubuntu server can be down with zero downtime using github action, nginx, and pm2.
date: 2023-06-08
tags:
  - ubuntu
  - node
  - pm2
  - nginx
---

## Summary

Deploying websites from GitHub onto an Ubuntu server with zero downtime can be achieved in a few simple steps. On a small website having a couple seconds of downtime on deploys is maybe ok, but its not needed :)

We will do a few things:

- Create a `nginx` config and get a cert
- Create a deploy script on the server
- Setup a GitHub runner and action

This guide assumes you have already installed `nginx`, `pm2`, and `certbot`.


### Create a `nginx` config

First we will create a basic `nginx` config and get a certificate from certbot.

We set to port 3000 initially, but you can put any number of port that is free. It will be changed later on.
```bash
cat > /etc/nginx/sites-enabled/example.com.conf << EOF
server {
  server_name example.com;
  location / {
    proxy_pass http://localhost:3000;
  }
}
EOF
```

You can test the config with `nginx -t`

Restart `nginx` with `systemctl retsart nginx` if everything looks good,

Now we can get a cert with `certbot --nginx -d example.com`

### Create a Deploy Script

Login to your server via `ssh` and create a folder where the site will be deployed to, for example:

```bash
mkdir -p /home/websites/example
```

Create a `deploy.sh` script in the new directory and make it executable.

```bash
cd /home/websites/example
touch deploy.sh
chmod +x deploy.sh
```


Next we will add a few pieces to the `deploy.sh` script. You can use `nano deploy.sh` and just paste in the bits as we go.

#### Bash

Add in a shebang to make the script run in `bash` (instead of `sh`) as a few of the functions use `bash` syntax.

```bash
#!/bin/bash
```

#### Port Chooser

Add in a function that will find a free port for the node process.

```bash
# Picks a random number between 3000 and 3999.
# from https://dev.to/justincy/blue-green-node-js-deploys-with-nginx-bkc
random_number() {
  floor=3000
  range=3999
  number=0
  while [ "$number" -le $floor ]
  do
    number=$RANDOM
    let "number %= $range"
  done
  echo $number
}

# Pick a random port between 3000 and 3999 that isn't currently being used.
PORT=$(random_number)
while [[ $(lsof -i -P -n | grep :$PORT) ]]
do
  PORT=$(random_number)
done

echo "Ready to deploy on port $PORT"

```

#### Downloading the Code

Then setup a few variables and download the code from GitHub. You will need a Personal Access Token if the repository is private.

```bash
APP="example"
BASE="/home/websites/$APP"
INSTALL="$BASE/$PORT"
TOKEN=github_pat_asdfasdf12314123

echo "Make dir $INSTALL"
mkdir -p $INSTALL

git clone --depth 1 "https://$TOKEN@github.com/<me>/<repo>.git" $INSTALL

cd $INSTALL
```

#### Install Deps and Build the Application

Now we can install the deps with your favorite package manager. Here I'm using `pnpm`.

```bash
pnpm install

echo "Create config.."

# update this path to where
cat > $INSTALL/.env.local << EOF
PORT=$PORT
# what else should be in your config?
EOF

echo "Build.."
pnpm run build
```

#### Start the PM2 Service

Now we can start up the `pm2` service. Be sure to to set the `GITHUB_EVENT_PATH` var to an empty string or `pm2` will stop the service after the GitHub work cleans up after itself.

```bash
echo "Start pm2.."
GITHUB_EVENT_PATH="" pm2 start pnpm  --max-memory-restart 300M -i -1 --name="$APP-$PORT" -- run serve
pm2 save
```

#### Update Nginx Config

The `nginx` config needs to be updated with the latest port number. We will just overwrite the file with new contents. Be sure to include the sections that `certbot` added as shown here.

```bash
# update nginx config
cat > /etc/nginx/sites-enabled/example.com.conf << EOF
server {
  server_name example.com;
  location / {
    proxy_pass http://localhost:$PORT;
  }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if (\$host = example.com) {
        return 301 https://\$host\$request_uri;
    } # managed by Certbot


  listen 80;
  server_name example.com;
    return 404; # managed by Certbot


}
EOF
```

Finally, add in a section to reload `nginx`. This will wait for old `nginx` process to close out so users don't get errors when we kill the old `pm2` service.

```bash
# reset start nginx
# from https://dev.to/justincy/blue-green-node-js-deploys-with-nginx-bkc
nginx_workers() {
  echo $(ps -ef | grep "nginx: worker process" | grep -v grep | wc -l)
}

echo "Reloading nginx..."
numWorkerProcesses=$(nginx_workers)
sudo nginx -s reload

# Wait for the old nginx workers to be retired before we kill the old server.
while [ $(nginx_workers) -ne $numWorkerProcesses ]
do
  sleep 1;
done;


# remove old p2m process
pm2 list | grep -o -P "$APP-\d+" | uniq | while IFS=$'\n' read process; do
  if [[ $process != $APP-*$PORT ]];
  then
    pm2 delete $process
  fi
done

pm2 save
```

#### Clean Up

The old directories can now be removed.

```bash
# from https://dev.to/justincy/blue-green-node-js-deploys-with-nginx-bkc
echo "Deleting old directories..."
for olddir in $(ls -d $BASE/3*); do
  if [[ $olddir != $INSTALL ]];
  then
    echo "Deleting $olddir"
    rm -rf $olddir
  else
    echo "Saving $olddir"
  fi
done;
```

### GitHub Runner

Now is the fancy part! In your GitHub repo follow the instructions in `settings/actions/runners` to create a "Self-Hosted" runner on your server.

In your GitHub repo you can setup an action that will trigger the deploy script on changes to the `master` branch:

```bash
name: 🚀 Deploy

on:
  push:
    branches:
      - master
  workflow_dispatch:

jobs:
  build:
    runs-on: self-hosted
    steps:
    - name: '🚀 Trigger deploy script'
      run: cd /home/websites/example/; ./deploy.sh
```

Enjoy :)

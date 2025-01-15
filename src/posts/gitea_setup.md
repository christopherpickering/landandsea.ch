---
title: Setup Gitea Code Repositories
description: How to install gitea on an ubuntu server.
date: 2019-05-26
tags:
  - code management
  - git
  - gitea
---

Special thanks to [Bryan Gilbert](https://bryangilbert.com/post/devops/how-to-setup-gitea-ubuntu/), whose tutorial this write up is based on.

## Create Git User

Login to the server. In this case we are using Ubuntu 18.

Create a user account "git" which will be used by gitea. There will be no password, but will have a home directory.

```bash
sudo adduser --system --shell /bin/bash --group --disabled-password --home /home/git git

```

## Create Database

Install postgresql.

```bash
sudo apt install postgresql
```

### Create DB User

Start sql session.

```bash
sudo su postgres
psql
```

Create user and database.

```bash
CREATE USER gitea WITH PASSWORD '<password>';
CREATE DATABASE gitea OWNER gitea;
# exit postgres.
\q
```

### Tune the DB

We will make a few tweaks to postgres config.

Open the conf file.

```bash
sudo nano /etc/postgresql/10/main/postgresql.conf
```

Set shared_buffers to 25% of total ram. Example: with 4gb ram:

```bash
shared_buffers= 1024MB

# other settings:
max_connections= 500
track_counts= on
autovacuum= on
work_mem= 4MB
```

Restart db.

```bash
sudo service postgresql restart
```

## Install Gitea

Next, we can install Gitea. You can get the current version number from [gitea](https://github.com/go-gitea/gitea/releases).

```bash
# change user to git
sudo su git

# make gitea directory
cd /home/git && mkdir gitea && cd gitea

# copy in the latest version of gitea
wget -O gitea https://dl.gitea.io/gitea/1.8.2/gitea-1.8.2-linux-amd64

# change permissions
chmod +x gitea

# exit git account
exit
```

The Gitea server can be run manually for testing if needed. The installation can be finished at this point as well, but we will wait until Nginx is running first.

```bash
./gitea web
```

## Setup Gitea Service

Next a service needs to be created to keep Gitea running, and restart it when the server restarts.

```bash
sudo nano /etc/systemd/system/gitea.service
```

Enter the service information.

```bash
[Unit]
Description=Gitea (Git with a cup of tea)
After=syslog.target
After=network.target
After=postgresql.service

[Service]
RestartSec=2s
Type=simple
User=git
Group=git
WorkingDirectory=/home/git/gitea
ExecStart=/home/git/gitea/gitea web
Restart=always
Environment=USER=git HOME=/home/git

[Install]
WantedBy=multi-user.target
```

Enable and start the service.

```bash
sudo systemctl enable gitea.service
sudo systemctl start gitea.service
```

## Setup Nginx

Install.

```bash
sudo apt install nginx
```

Create the Nginx site.

```bash
sudo nano /etc/nginx/sites-enabled/gitea
```

Enter server information.

```bash
server {
    listen 80;
    server_name <your-domain or IP address>;

    location / {
        proxy_pass http://localhost:3000;
    }

    proxy_set_header X-Real-IP $remote_addr;
}
```

Finally, remove the default Nginx site and reload Nginx.

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo service nginx reload
```

Change the upload limit size in Nginx.

```bash
sudo nano /etc/nginx/nginx.conf
# change this line to the size you need. If line is not there, add to the http {} section.
client_max_body_size = 100M;
```

Restart Nginx.

```bash
service nginx restart
```

## Completed Installation

Now you can navigate to the website and complete installation. You will need to enter the db password, etc.

https://docs.gitea.io/en-us/customizing-gitea/

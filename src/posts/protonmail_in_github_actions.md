---
title: How to use Protonmail Bridge in GitHub actions or Docker!
description: Using Protonmail Bridge in automation pipelines can easily be done in GitHub action and Docker containers.
date: 2022-11-30
tags:
  - Protonmail
  - Docker
  - GitHub actions
---

Using Protonmail Bridge in automation pipelines can be useful for sending emails etc using their SMPT service.

It took a bit to figure out, but in the end it is fairly simple.

You may be interested in more configuration options from [Protonbridge CLI docs](https://proton.me/support/bridge-cli-guide).

## Install some package

```bash
sudo apt update
sudo apt install -y pass gnupg wget libqt5gui5 libqt5core5a libqt5widgets5 libqt5qml5 libqt5network5 libqt5svg5 libpulse-mainloop-glib0 fonts-dejavu libsecret-1-0
```

## Setup a password manager

This is the trickiest step.

```bash
gpg --batch --passphrase '' --quick-gen-key 'ProtonMail Bridge' default default never
pass init "ProtonMail Bridge"
```

## Install Protonmail Bridge

```bash
mkdir protonmail-bridge && cd protonmail-bridge
wget https://proton.me/download/bridge/protonmail-bridge_2.3.0-1_amd64.deb
sudo dpkg -i *.deb
```

## Login to the Bridge

Here, substitute `$LOGIN_EMAIL` and `$LOGIN_PASSWORD` for your actual credentials.

```bash
protonmail-bridge --cli << EOT
login
$LOGIN_EMAIL
$LOGIN_PASSWORD
EOT
```

## Change the secutiry method for SMPT

This is optional. Change the SMTP security from TTL to SSL if needed for your sender.

```bash
protonmail-bridge --cli << EOT
change smtp-security ssl
yes
EOT
sleep 5 # just in case we need to wait for bridge to restart.
```

## Get the SMTP connection info from the bridge

Next we can get the login info from the bridge.

```bash
CONNECTION=$(protonmail-bridge --cli << EOT
info 0
EOT
)
EMAIL_RELAY_PASSWORD=$(echo $CONNECTION | grep -Po 'Password: \K[^ ]+' | head -1)
```

Hostname will be `localhost`.
Port will be `1143` but can be changed with another cli command.
Username will be your login email address.

## Start Protonmail Bridge as a headless process

```bash
nohup protonmail-bridge --noninteractive > bridge_log.txt 2>&1 & disown
sleep 1
```

Thats about it!

You can now send emails using the config we have found:

```python
hostname="localhost"
port=1143
use_ssl=True
username=<your proton email address>
password=$EMAIL_RELAY_PASSWORD
```

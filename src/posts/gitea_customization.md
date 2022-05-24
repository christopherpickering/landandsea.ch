---
title: How to Customize Gitea
description: Customizing a new install of gitea.
date: 2019-05-26
tags:
  - code management
  - git
  - gitea
---

<div class="notification">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

## Language Changes

All language changes for keywords are in the i18n files. In our case we need to change the app_desc on the home page.

::: content

1. Login to server
2. Change user to "git" `sudo su git`
3. Change directory to Gitea. `cd /home/git/gitea/custom`
4. Make directory for change. `mkdir options && cd options`
5. Make directory for languages. `mkdir locale && cd locale`
6. Create language file. `nano locale_en-US.ini`
7. Copy everything from the template source from Gitea.
8. Change any lines that you want changed.
9. Exit as git user. `exit`
10. Restart Gitea service. `sudo systemctl restart gitea`
    :::

## Edit Home Page

Navigate as git user to /home/git/gitea/custom

::: content

1. Make a directory for the templates. `mkdir templates && cd templates`
2. Create template file & copy in source. `nano home.tmpl`
3. Restart Gitea service after making changes. `sudo systemctl restart gitea`
   :::

## Change Landing Page

Navigate as git user to `/home/git/gitea/custom/conf`

Edit `app.ini`

```bash
sudo nano app.ini

# add section:
[server]
LANDING_PAGE = explore
```

## Restart Gitea After Changes

The Gitea service must be restarted for any changed to take affect.

```bash
sudo systemctl restart gitea
```

or

```bash
sudo systemctl stop gitea
sudo systemctl start gitea
```

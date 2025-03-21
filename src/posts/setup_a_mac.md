---
title: Setting Up a Mac
description: How to setup a new mac for web development.
date: 2019-12-26
tags:
  - mac
---

## Time Machine

To add a size limit to time machine backups. Backup size should be around 1.5x the hard drive size.. so 500gb > 750gb > 750 x 1024 = 768000

```bash
sudo defaults write /Library/Preferences/com.apple.TimeMachine MaxSize 102400
```

## Sublime Text

### Useful packages

::: content

- Virtualenv
- HTMLBeautify
- SideBarEnhancements
- ZPL Format
  :::

## Homebrew

### useful packages

- tree - used in terminal to pretty print directory contents.

```bash
tree -v --charset utf-8 -I venv
```

- python3

```bash
brew install python3
```

If you upgrade python the links in virtualenv's will break. They can be deleted and recreated.

If you are in a directory with a virtual envirenment called venv this should work:

```bash
# find broken links
find venv/ -type l
# delete broken links
find venv/ -type l -delete
# create new links
virtualenv venv
```

## Terminal

Nice color scheme - http://color.smyck.org

## Safari DNS

https://cleanbrowsing.org/filters

## Keymapping

Somehow the home and end buttons on the apple keyboard don't go to the right place :)

This will fix it -

```bash
# create/edit the key bindings file
cd ~/Library
mkdir KeyBindings
sudo nano ~/Library/KeyBindings/DefaultKeyBinding.Dict

# paste in and save. You will need to restart your mac
{
    "\UF729"  = moveToBeginningOfParagraph:; // home
    "\UF72B"  = moveToEndOfParagraph:; // end
    "$\UF729" = moveToBeginningOfParagraphAndModifySelection:; // shift-home
    "$\UF72B" = moveToEndOfParagraphAndModifySelection:; // shift-end
    "^\UF729" = moveToBeginningOfDocument:; // ctrl-home
    "^\UF72B" = moveToEndOfDocument:; // ctrl-end
    "^$\UF729" = moveToBeginningOfDocumentAndModifySelection:; // ctrl-shift-home
    "^$\UF72B" = moveToEndOfDocumentAndModifySelection:; // ctrl-shift-end
    "$\U007F" = deleteWordBackward:;
}
```

More options can be found in [this gist](https://gist.github.com/christopherpickering/d646f1ba175336852e6c0d96bf243c21)

## Using Oracle EBS

### Install Firefox

Firefox 52 is the last version working with Oracle EBS Forms. Download it [here.](https://ftp.mozilla.org/pub/firefox/releases/52.9.0esr/)

### Install Java

The latest version of java is currently working well. You can download [here.](https://java.com/en/download/mac_download.jsp)

### Change settings in Java Control Panel

EBS Forms needs to be allowed as a safe site in Java.

::: content

1. On the mac open System Preferences > Java.
2. In Java Control Panel Security Tab > Edit Site List.
3. Add in the root of your ebs system. Example: http://ebs.domain.com
   :::

### First Use

On the first use when logging in in Firefox click "activate java" when prompted, and then allow popups when prompted.

## Terminal Alias

If you are typing the same phrase in terminal over and over and over it may be handy to create an alias name..

```bash
# edit bash profile
nano ~/.bash_profile

# for catelena and newer
nano ~/.zprofile

# add in the alias

# Aliases - remember no spaces at equals sign
alias act="source venv/bin/activate"
alias dact="deactivate"
alias ip="ifconfig | grep 'inet '"
alias gc="git add . && git commit -m "
# save
# restart terminal or reload
source ~/.bash_profile
```

## UTF-8 Error when running python 3scripts from terminal, or through venv in Sublime

Edit your bash profiel to include these two lines -

```bash
# edit file
nano ~/.bash_profile

# add these lines and save.
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

## Add Option to Finder Menu to Share Files with Outlook

::: content

1. Open Automator
2. Create new "Quick Action"
3. Change the first option for "Workflow receives Current" to "files or folders"
4. Change application to "Finder"
5. Add an action - "Get Specified Finder Items"
6. Add an action - "Run Apple Script"
7. Paste the following Apple Script into the text box. Script from [here](https://answers.microsoft.com/en-us/mac/forum/macoffice2011-macstart/moving-the-automator-folder-doesnt-allow-1424-to/983a1074-34ee-40d6-b8ae-7f4d2ff45718)
   :::

```applescript
on run {input, parameters}
set SelectedItems to input
tell application "Finder" to set fileName to name of first item of SelectedItems
tell application "Microsoft Outlook"
    set newMessage to make new outgoing message with properties {subject:fileName}
    tell newMessage
        repeat with aFile in SelectedItems -- the loop through all selected items
            make new attachment with properties {file:aFile}
        end repeat
    end tell
    open newMessage
    get newMessage
end tell
return input
end run
```

{% image "./src/static/img/posts/setup_a_mac-automator1.png", "mac automator", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

8. Save script with a nice name. Now when you right click on a folder/file there will be an option to share with outlook!

{% image "./src/static/img/posts/setup_a_mac-automator2.png", "mac automator", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

## Run as website from any directory

To run a website localy from any server

```bash
cd to/path/of/site
python3 -m  http.server 8001 # or any port #
```

Navigate to 0.0.0.0:8001

## Terminal Upgrade

Install [iterm2](https://www.iterm2.com)

Install Oh My [Zsh](https://github.com/robbyrussell/oh-my-zsh)

Edit Alias for Oh My Zsh

```bash
nano ~/.zshrc

# reload settings
source ~/.zshrc
```

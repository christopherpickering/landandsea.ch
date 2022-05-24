---
title: How to Change the DNS Servers on You iPhone
description: Changing the DNS server on an iPhone.
date: 2020-05-06
tags:
  - iphone
  - dns
  - network
---

<div class="notification">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

Why change it? There are several benefits to changing it!

::: content

- Blocking ads
- Blocking inappropriate content
- Speeding up your browsing
  :::

Sadly there is no visible setting on the iPhone to change the DNS server while using LTE! It is simple when using WIFI (Settings > Wifi > etc)

## Step 1 - install iBackupBot

This is an application that lets you edit some of the source files on your phone. Specifically the network settings file :)

Download from [https://www.icopybot.com/itunes-backup-manager.htm](https://www.icopybot.com/itunes-backup-manager.htm).

## Step 2 - backup your phone

While that is downloading and installing, take a fresh backup of your phone onto your computer.

## Step 3 - open iBackupBot

Open iBackupBot. It will automatically detect your last backup and load it. Navigate to the file "iPhone > System Files > SystemPreferencesDomain > System Configuration." Select the "preferences.plist" file from the file list and open with the built in editor. It may ask for a license. Press cancel for now and the editor will open.

If your are nervous about breaking your phone, take two backups before starting :)

{% image "./src/static/img/posts/iphone-dns-filesystem.png", "iPhone filesystem", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

## Step 4 - edit the file

Find the section for "Ip1".

Each section has a name that is a really long string of numbers and letters. After the string will be `<dict>...<key>Interface</key>...<key>DeviceName</key>...<string>ip1</string>`

After the first `<dict>` you can insert a DNS section (or edit if it is already there.) In this example I have the DNS for [cleanbrowsing.org](https://cleanbrowsing.org). You could also put Ad-guard-family filters for example.

```xml
<key>DNS</key>
<dict>
	<key>ServerAddresses</key>
	<array>
	   <string>185.228.168.10</string>
	   <string>185.228.168.11</string>
	</array>
</dict>
```

{% image "./src/static/img/posts/iphone-dns-dnssettings.png", "iPhone DNS settings", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

## Step 5 - save and restore phone

Finally, save the edits to the file, and close the file by clicking the red power button.

Now we can save the file to the phone! Make sure you have the file highlighted still, then click the "Restore" button. Click "ok" on the prompt.

{% image "./src/static/img/posts/iphone-dns-restore.png", "iPhone restore", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

You may get an error message with a code. Click the "about restore error" and there will be instructions on how to resolve. In my case I needed to disable "Find My Phone" and then reboot the phone. This also restarted the iBackupBot.
If you are unable to restore with iBackupBot, restart the process and after saving the file use iTunes to restore your phone.

## Step 6 - restore any settings

Don't forget to turn "find my phone" back on!

Check [dnsleaktest.com](https://dnsleaktest.com) to make sure DNS is working!

Unfortunately this didn't work on my phone using Verizon :(.

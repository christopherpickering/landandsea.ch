---
title: How To Use An Apple Keyboard on Windows 10
description: Simple steps to use an Apple magic keyboard on a mac.
date: 2020-09-19
tags:
  - windows
---

:::content

1. Plug it in 😄
2. [Download](https://support.apple.com/downloads/bootcamp-drivers) the latest bootcamp driver from Apple.
3. Extract and grab the two files needed. The files needed are in `BootCamp/Drivers/Apple/BootCamp.msi` and `AppleKeyboardInstaller64.app`.
4. Put them into a separate folder.
5. Open `cmd.exe` as admin and navigate to folder containing the two files.
6. Run `call BootCamp.msi`
7. Follow the installer steps
8. Open Windows 10 settings > language > click options
   {% image "./src/static/img/posts/windows-10-lang.png", "Windows 10 mac keyboar", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}
9. Add keyboard “United States (Apple)”
10. Reboot > special keys should work.
    :::

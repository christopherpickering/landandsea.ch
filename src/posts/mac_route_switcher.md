---
title: Mac Network Route Switcher
description: Make a script to split your network traffic between several network interfaces on your Mac!
date: 2022-06-10
tags:
  - mac
  - network
---

There is a neat tool called [SwitchHosts](https://swh.app) that lets you easily configure hosts on your mac. But what about network routes? What if you want to send specific traffic to different interfaces?

When you use a VPN with split tunneling, it can do some of that automatically.. but you can't tweak it.

I found a script somewhere in the internet and tweaked it a bit to let you do this.

There are a few great uses!

1. Split your work and home internet traffic
2. Run a vpn router for streaming separately than a local wifi
3. Split traffic between several wifi connections
4. ... you get the point or you wouldn't be here :)

You can tweak this to add in more "special" interfaces as needed.

```py
import os
import subprocess
import sys

# a couple useful commands:
#
# list networks: networksetup -listallhardwareports
# List routes: netstat -nr
# netstat -nrf inet
# test route: route get 10.1.2.197

# This is gonna be your primary/default interface
WIRELESS_INTERFACE = {
    "interface": 'en0',
    "router": "192.168.1.1"
    }

# This is where you wanna send "special" traffic.
TUNNEL_INTERFACE = {
    "interface":'en6',
    "router": "123.456.789.012"
    }


# Ranges of IP's that should go to your "special" interface
VPN_NETS = [
    '10.1.2.0/24',
    '10.1.3.0/24',
]

# List of IP addresses that should go to your "special" interface
VPN_HOSTS = [
    '123.45.67.89',
]

def split_vpn_traffic():
    if os.getuid() != 0:
        sys.exit("Please, run this command with sudo.")

    print("Resetting routes with gateway " + WIRELESS_INTERFACE["router"])
    subprocess.call(
        ("route", "-n", "delete", "default", "-ifscope", WIRELESS_INTERFACE["interface"])
    )
    subprocess.call(
        ("route", "-n", "delete", "-net", "default", "-interface", TUNNEL_INTERFACE["interface"])
    )
    subprocess.call(
        ("route", "-n", "delete", "-net", "default",TUNNEL_INTERFACE["router"])
    )


    subprocess.call(("route","flush"))
    subprocess.call(("route", "-n", "add", "-net", "default", WIRELESS_INTERFACE["router"]))

    print("\nAdding routes for addresses which should go through VPN.")
    for addr in VPN_NETS:
        subprocess.call(
            ("route", "-n", "add", "-net", addr, TUNNEL_INTERFACE["router"])
        )
    for addr in VPN_HOSTS:
        subprocess.call(
            ("route", "-n", "add", "-host", addr, TUNNEL_INTERFACE["router"])
        )

if __name__ == "__main__":
    split_vpn_traffic()

```

Save it as `split_host.py`, and then run it with `sudo python split_host.py`. Routes are reset when you reboot your mac so you will need to run this after each reboot. You could setup a job to run this script when your computer boots with automator.

Also note that the first `route flush` call can take a minute to complete.

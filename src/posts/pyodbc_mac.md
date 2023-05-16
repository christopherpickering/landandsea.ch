---
title: Installing Pyodbc on a Mac - Oracle Database
description: Installing Pyodbc on a mac for connecting to oracle databases.
date: 2019-12-14
tags:
  - mac
  - pyodbc
  - mssql
  - database
---

<div class="rounded border p-4 bg-white/80">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

## Install FreeTDS and UnixODBC

### Install Homebrew

If Homebrew is not installed, get that first.

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

```bash
brew install unixodbc
brew install freetds
```

## Configure TDS Connection Information

Edit the file `/usr/local/etc/freetds.conf`

```bash
nano /usr/local/etc/freetds.conf
```

Add your connection information to the end.

```bash
[<connection_name>]
host = <hostname>
port = <port>
tds version = 7.0
```

Test the new connection with

```bash
tsql -S <connection_name> -U <username> -P <password>
```

## Add TDS Connection info to the ODBC driver list

Run odbcinst -j to find the file directories for `odbcinst.ini` and `odbc.ini`

Update odbcinst.ini to include the info below.

```bash
odbcinst -j

# get path from results of odbcinst -j
nano /usr/local/etc/odbcinst.ini

[FreeTDS]
Description=FreeTDS Driver for Linux & MSSQL
Driver=/usr/local/lib/libtdsodbc.so
Setup=/usr/local/lib/libtdsodbc.so
UsageCount=1

# control x to save
```

Next, edit the `odbc.ini` file.

Add the following info.

```bash
odbcinst -j

# get path from results of odbcinst -j
nano /usr/local/etc/odbc.ini

[<connection_name>]
Description         = <connection_description>
Driver              = FreeTDS
Servername          = <connection_name>

# note: FreeTDS must match the name given in odbcinst.ini
```

## Install pyodbc

Finally, `pyodbc` for python can be installed

```bash
pip install pyodbc
```

---
title: Installing Pyodbc on Ubuntu Server - Oracle Database
description: Short guide on installing python package pyodbc on an Ubuntu server in order to connect to Oracle databases.
date: 2019-03-21
tags:
  - ubuntu
  - pyodbc
  - mssql
  - database
---

## Install FreeTDS and UnixODBC

```bash
sudo apt-get install unixodbc unixodbc-dev freetds-dev tdsodbc freetds-bin
```

## Configure TDS Connection Information

Edit the file /etc/freetds/freetds.conf

```bash
nano /etc/freetds/freetds.conf
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

Run odbcinst -j to find the file directories for odbcinst.ini and odbc.ini

Update odbcinst.ini to include the info below.

```bash
odbcinst -j

# get path from results of odbcinst -j
nano /etc/odbcinst.ini

[FreeTDS]
Description=FreeTDS Driver for Linux & MSSQL
Driver = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
Setup = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
CPTimeout =
CPREuse =
FileUsage = 1

# control x to save
```

Next, edit the odbc.ini file.

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

Finally, pyodbc for python can be installed

```bash
pip install pyodbc
```

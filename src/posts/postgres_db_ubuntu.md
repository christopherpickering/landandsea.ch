---
title: Migrating from MySQL to Postgres on Ubuntu Server
description: How to move a Django database from mysql to postgresql on an ubuntu server.
date: 2018-12-19
tags:
  - ubuntu
  - postgres
  - database
---

<div class="rounded border p-4 bg-white/80">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

## Install Postgres

```bash
sudo apt install postgresql postgresql-contrib
```

Set ps to run on startup

```bash
sudo update-rc.d postgresql enable
```

Next start a postgres session

```bash
sudo -u postgres psql
```

## Create Userer and DB

### Create a user

```sql
CREATE ROLE username WITH LOGIN PASSWORD 'password' ;
```

### Add permissions to user

```sql
ALTER ROLE username CREATEDB;
```

### Create a Database

```sql
CREATE DATABASE databasename;
```

### Add Authorized Users to Database

```sql
GRANT ALL PRIVILEGES ON DATABASE databasename TO username;
```

## Navigation

```sql
# List all database
\list

# Connect to database
\connect databasename

# List all tables
\dt
```

## Django Setup

First install the PostgreSQL helper

```bash
pip install psycopg2-binary
```

Next, add the database to settings.py

```python
'postgresql': {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'NAME': 'bdname',
    'USER': 'username',
    'PASSWORD': 'pass',
    'HOST': '127.0.0.1',
    'PORT': '',
}
```

Ensure migrations are up to date

```bash
python manage.py makemigrations
python manage.py migrate
```

Migrate settings to the new database and ensure tables are clear for import.

```bash
python manage.py migrate --database=posgresql
python manage.py sqlflush --database=postgresql
```

Export MySQL database to json.

```bash
python manage.py dumpdata --all --natural-primary --indent=4 > dbname.json
```

Import json to Postgres

```bash
python manage.py loaddata dbname.json --database=postgresql
```

Finally change the default database in `settings.py` to the PostgreSQL connection.

## Tips

### Restarting Postgres

```bash
sudo service postgresql restart
```

### Tuning

Edit conf file. You can start a session with PostgreSQL and run `SHOW config_file;` to see its location.

```bash
sudo nano /etc/postgresql/10/main/postgresql.conf
```

Set shared_buffers to 25% of total ram. Example: with 4gb ram:

```bash
shared_buffers = 1024MB
```

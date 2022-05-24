---
title: Moving Django database from MySQL to PostgreSQL on Mac
description: How to move a Django database from mysql to postgresql using a mac host.
date: 2019-05-25
tags:
  - mac
  - postgres
  - database
---

<div class="notification">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

## Moving from MySQL to PostgreSQL on Mac

### Install PostgreSQL with Brew

First install PostgreSQL

```bash
brew install postgresql
```

Allow ps to auto start

```bash
pg_ctl -D /usr/local/var/postgres start && brew services start postgresql
```

### Create User and DB

#### Open PostgreSQL session

```bash
## if you need to exit at any time, press ctl+d, or \q
psql postgres
```

#### Create a user

```sql
CREATE ROLE username WITH LOGIN PASSWORD 'password' ;
```

#### Add permissions to user

```sql
ALTER ROLE username CREATEDB;
```

#### Create a Database

```sql
CREATE DATABASE databasename;
```

#### Add Authorized Users to Database

```sql
GRANT ALL PRIVILEGES ON DATABASE databasename TO username;
```

### Navigation

```sql
# List all database
\list

# Connect to database
\connect databasename

# List all tables
\dt
```

### Django Setup

First install the PostgreSQL helper

```bash
pip install psycopg2-binary
```

Next, add the database to `settings.py`

```python
	,
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
python manage.py dumpdata --all --natural --indent=4 > dbname.json
```

Import json to PostgreSQL

```bash
python manage.py loaddata dbname.json --database=postgresql
```

Finally change the default database in `settings.py` to the PostgreSQL connection.

### PostgreSQL Config

If you installed with Homebrew, the config file will be here:

```bash
/usr/local/var/postgres
```

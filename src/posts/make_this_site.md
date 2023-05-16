---
title: How To Make This Site [Old]
description: How to make a static website using a homemade python based static site generator.
date: 2020-10-19
tags:
  - about
  - web development
---

<div class="rounded border p-4 bg-white/80">
 👋 Thanks for reading! Things have changed since this was written, take it with a grain of salt ;)
</div>

This tutorial was original made for a python static site generator. Since then, this site has moved to the [11ty ssg](https://www.11ty.dev). The original site can still be found [here](https://christopherpickering.github.io/old.christophers.tips.site/).

This site can be made in a few simple steps -

::: content

- Setup the project
- Add content
- Register a domain with Google
- Add CNAME records
  :::

### Clone this project

Clone the project

```bash
git clone https://github.com/christopherpickering/christophers.tips.git
```

### Create a virtual environment

```bash
# rename project
mv 'christophers.tips' 'myproject'
cd myproject
virtualenv venv

# activate (you do have python installed, right?)
source venv/bin/activate

# install a few packages
pip install jinja2
pip install markdown2
pip install pigments
pip install html5print
pip install csscompressor
```

### Make a directory for the website to generate into

```bash
mkdir website
```

### Add a git repo to your project

```bash
# one for the markdown
git init
git remote add origin /path/to/remote

cd website
git init
git remote add origin /path/to/remote

```

## Add content

First, update the `book.json` file to your site information.

The home page is top level in the directory - `index.md`. Any other page for the site is in the `pages/` directory.

After adding a new page the `book.json` file needs to be updated to include the new page in the menu.

When you are ready to publish your content, be sure the virtual environment is active. Then run the update script.

```bash
./build.bash

# or on windows cmder
bash build.bash
```

## Register a Domain With Google

Navigate to [domains.google.com](domains.google.com) and register a domain. Got to the DNS tab and add in the CNAME information.

{% image "./src/static/img/posts/make_this_site-CNAME.png", "CNAME", "(min-width:800px) 50vw, 100vw", "", "lazy", "async" %}

## Add CNAME Records to your project

```bash
cd ../site
touch CNAME
nano CNAME
```

Add two lines to the CNAME file

```bash
mysite.com
www.mysite.com
```

Finally, build and push the site.

```bash
./build.bash
```

Nice! You will be able to see you site now at mysite.com!

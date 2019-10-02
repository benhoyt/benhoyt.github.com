---
layout: default
title: Highlights of the Python standard library
permalink: /writings/highlights-of-python-stdlib/
description: Highlights and walkthrough of the Python standard library
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">October 2019</p>


Python comes with "batteries included", meaning there are a lot of goodies in the standard library right out of the box. This article describes the functions and modules I find useful for writing scripts and web servers -- and I hope others will find them useful too.

Some of these are very well used (but Python's stdlib is large enough that its easy to miss some); others are fairly rare but still useful.

Of course, this is just a one-page overview. You can always go to the full list and full details in the [official docs](https://docs.python.org/3/library/index.html). I've tried to link to that where appropriate below -- I'm referencing the Python 3.x documentation. Hopefully in October 2019 you're writing Python 3 code ... if not, almost all of these exist in Python 2.7.

TODO: table of contents

## Comprehensions

Okay, so this isn't a standard library feature, but comprehensions are so useful *in conjuntion with* builtin and standard library functions that I wanted to address them.

Most people are familiar with list comprehensions. They're a language construct for building a new list out of an existing iterable:

```python
>>> [n*n for n in range(1, 6)]               # squares of 1,2,3,4,5
[1, 4, 9, 16, 25]
>>> [n*n for n in range(1, 11) if n%2 == 0]  # squares of 2,4,6,8,10
[4, 16, 36, 64, 100]
```

You can nest list comprehensions, but my rule of thumb is not to nest unless you have a really good reason -- the order is not immediately clear, and they can get pretty hairy if they span more than a couple of lines.

What's less well known are dict, set, gen expr

- comprehensions: list, dict, set, generator expr

- builtin functions: any, all, dict, enumerate, filter/map (don't use), max/min, open, reversed, sorted, 
- text: re, difflib, textwrap, unicodedata, io, email, base64, mimetypes, gettext
- time: time, datetime
- enum
- data structures: collections, heapq, bisect
- misc: pprint
- numbers: math, decimal, random
- itertools, functools, operator
- OS and paths: os, os.path, pathlib, scandir, tempfile, glob, shutil, platform, sys
- sqlite3!
- compression: zlib, gzip, zipfile
- parsing: json, csv, configparser
- hash: hashlib (sha1 etc)
- program: argparse, logging, fileinput, warnings
- ctypes
- threads/processes: threading, multiprocessing, subprocess, queue
- asyncio, socket, mmap
- html, xml
- urllib, urllib.request, http, http.client, http.server, smtplib
- typing / mypy
- unittest, unittest.mock
- timeit
- venv

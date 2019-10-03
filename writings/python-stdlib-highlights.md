---
layout: default
title: Highlights of the Python standard library
permalink: /writings/python-stdlib-highlights/
description: Highlights and walkthrough of the Python standard library
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">October 2019</p>


Python comes with "batteries included", meaning there are a lot of goodies in the standard library right out of the box. This article describes the functions and modules I find useful for writing scripts and web servers -- and I hope others will find them useful too.

Some of these are very well used (but Python's stdlib is large enough that its easy to miss some); others are fairly rare but still useful.

Of course, this is just a one-page overview. You can always go to the full list and full details in the [official docs](https://docs.python.org/3/library/index.html). I've tried to link to that where appropriate below -- I'm referencing the Python 3.x documentation. Hopefully in October 2019 you're writing Python 3 code ... if not, almost all of these exist in Python 2.7.

## Contents

* [Comprehensions](#comprehensions)
* Builtin functions
* Text processing
* Date and time
* Data structures
* TODO


## Comprehensions

Okay, so this isn't a standard library feature, but [comprehensions](TODO) are so useful *in conjuntion with* builtin and standard library functions that I wanted to address them explicitly.

Most people are familiar with *list comprehensions*. They're a language construct for building a new list out of an existing iterable:

```python
>>> [n*n for n in range(1, 6)]               # squares of 1,2,3,4,5
[1, 4, 9, 16, 25]
>>> [n*n for n in range(1, 11) if n%2 == 0]  # squares of 2,4,6,8,10
[4, 16, 36, 64, 100]
```

A bit less well known are dict and set comprehensions. They operate exactly the same way, except they build `dict` and `set` objects:

```python
>>> {t: get_thread(t) for t in thread_ids}  # dict of threads by ID
{1: <Thread 1>, 2: <Thread 2>, 3: <Thread 3>}
>>> {ord(c) for c in 'hello'}               # set of unique code points
{104, 108, 101, 111}
>>> 
```

Still less well known are *generator expressions* -- though a lot of people have used them without realizing it. The syntax is just like a list comprehension but with `(...)` parentheses instead of `[...]` brackets. They create a lazily-evaluated generator, but in a much more succinct way than a `def` with a `yield`.

A nice thing about generator expressions is you can omit the extra parens if there are already parens. Some examples:

```python
>>> sum(n*n for n in range(10))           # sum of squares of 0..9
285
>>> words = ['Foo', 'zoo', 'bar']
>>> sorted(w.lower() for w in words)      # transform and sort
['bar', 'foo', 'zoo']
>>> sorted((w.lower() for w in words), reverse=True)
['zoo', 'foo', 'bar']                     # note: need extra parens here
```

Very powerful, very concise, and yet very clear.

You can nest multiple `for` loops inside a single comprehension, but I think you lose clarity -- the order is not immediately clear, and they can get pretty hairy if they span more than a couple of lines. Like any other powerful tool, use them wisely!


## Builtins

Python has a number of builtin functions, or *builtins*, that are so useful they're available everywhere without an `import`. Here are a few of the ones I find especially useful:

### `all` and `any`

The `all` and `any` functions return `True` if all (or any) of the items in an iterable are truthy, otherwise `False`. They're very handy in conjuction with generator expressions.

```python
>>> strings = ['123', '0', 'x']
>>> all(s.isdigit() for s in strings)     # True if all strings are integers
False
>>> any(t.is_running() for t in threads)  # True if any thread still running
True
```

TODO: usually not needed, but nicer than !!

### Containers: `dict`, `frozenset`, `list`, `set`, and `tuple`

TODO: including optional start=

### Reflection: `callable`, `delattr`, `getattr`, `globals`, `hasattr`, `isinstance`, `issubclass`, `locals`, `type`, and `vars`

### `filter`, `map`, and `zip`

### Iterating: `enumerate`, `iter`, `len`, `next`, `range`, and `reversed`

### Files: `open`

### I/O: `format`, `input`, `print`, and `repr`

### Conversion: `ascii`, `bin`, `bool`, `chr`, `float`, `hex`, `int`, `oct`, `ord`, and `str`

### Byte types: `bytearray`, `bytes`, and `memoryview`

### Identity: `hash`, `id`, `object`, and `super`

### Math: `abs`, `complex`, `divmod`, `max`, `min`, `pow`, `round`, and `sum`

The `sum` function is self-explanatory -- it just adds up all the numbers in the given iterable. And it can also take an optional "start" value if you don't want to start at zero:

```python
>>> sides = [1.5, 3, 1.5, 3]
>>> sum(sides)                          # perimeter
9.0
>>> sum((ord(c) for c in 'abc'), 1000)  # really bad hash function
1294
```

TODO: min, max, including default= and key= params

### Sorting: `sorted` and `list.sort`

### Others:

* Exception hierarchy
* breakpoint, classmethod, compile, dir, eval, exec

'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright', 'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'exit', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', *** UP TO HERE *** 'int', 'isinstance', 'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip']





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

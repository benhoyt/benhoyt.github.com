---
layout: default
title: Walkthrough of the Python standard library
permalink: /writings/python-stdlib/
description: Walkthrough of the Python standard library
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">October 2019</p>

<!-- TODO: rename file -->

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

Okay, so these aren't a standard library feature, but [comprehensions](TODO) are so useful *in conjuntion with* builtin and standard library functions that I wanted to address them.

Most people are familiar with **list comprehensions.** They're a language construct for building a new list out of an existing iterable:

```python
>>> [n*n for n in range(1, 6)]               # squares of 1,2,3,4,5
[1, 4, 9, 16, 25]
>>> [n*n for n in range(1, 11) if n%2 == 0]  # squares of 2,4,6,8,10
[4, 16, 36, 64, 100]
```

A bit less well known are **dict and set comprehensions.** They operate exactly the same way, except they build `dict` and `set` objects:

```python
>>> {t: get_thread(t) for t in thread_ids}  # dict of threads by ID
{1: <Thread 1>, 2: <Thread 2>, 3: <Thread 3>}
>>> {ord(c) for c in 'hello'}               # set of unique code points
{104, 108, 101, 111}
>>> 
```

Still less well known are **generator expressions** -- though a lot of people have used them without realizing it. The syntax is just like a list comprehension but with `(...)` parentheses instead of `[...]` brackets. They create a lazily-evaluated generator, but in a much more succinct way than a `def` with a `yield`.

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

Python has a number of [builtin functions](TODO), or *builtins*, that are so useful they're available everywhere without an `import`. Here's the complete list of builtins, grouped by category (I bet there are a few you hadn't seen before):

### Iterating: `all`, `any`, `enumerate`, `iter`, `len`, `next`, `range`, `reversed`

The `all` and `any` functions return `True` if all (or any) of the items in an iterable evaluate to true, otherwise `False`. They read really well in an `if` statement, and they're very handy in conjuction with generator expressions:

```python
>>> strings = ['123', '0', 'x']
>>> all(s.isdigit() for s in strings)     # True if all are integers
False
>>> import threading                      # True if any thread running
>>> any(t.is_alive() for t in threading.enumerate())
True
```

`enumerate` is a generator that gives you a zero-based loop index along with the item you're iterating. Often coders familiar with `for (i=0; i<len; i++)` loops in C and other languages will start their loops with:

```python
for i in range(len(strings)):
    s = strings[i]
    ...
```

But Pythonistas use `enumerate`! It even takes on optional `start` parameter if you want to start at something other than zero:

```python
>>> for i, s in enumerate(strings):
...     print(f'{i} - {s}')
...
0 - 123
1 - 0
2 - x
>>> [i*s for i, s in enumerate('abc', start=1)]
['a', 'bb', 'ccc']
```

`iter` is a bit less common: with one argument, it returns an iterator from an iterable -- but you can usually just use the iterable directly, so this isn't very useful. However, if you give it two args, a callable and a "sentinel", it returns an iterator that calls the function until it returns the sentinel value. For example, to read a file in 4-byte chunks:

```python
>>> for chunk in iter(lambda: f.read(4), b''):
...    print(chunk)
b'\x89PNG'
b'\r\n\x1a\n'
...
```

That's significantly more concise than the typical `while True` loop:

```python
>>> while True:
...     chunk = f.read(4)
...     if chunk == b'':
...         break
...     print(chunk)
```

Interestingly, as of Python 3.8 you can use a `:=` assignment expression to make this even simpler:

```python
>>> while (chunk := f.read(4)) != b'':
...     print(chunk)
```

`len` is rather obvious: it returns the length of a string or container. For a string it returns the number of Unicode codepoints, for a byte string the number of bytes. It also returns the number of items in a list, set, or dict. It also works on containers or types that define a custom `__len__`. TODO: does `len` belong in this section?

`next` calls an iterator's `__next__` function. If `__next__` raises `StopIteration`, `next()` does too -- unless you provide a second argument as the default. This function is fairly rare, because you almost always use a `for` loop directly, but it can be handy to fetch the first item from a generator expression:

```python
>>> nums = [1, 3, 9]
>>> next(n for n in nums if n%3 == 0)  # if you know iterator is non-empty
3
>>> next((n for n in nums if n%2 == 0), -1)  # provide a default if unsure
-1
```

`range` returns an iterator that generates integers from a starting number to a stopping point. With just a single argument is goes from 0 to arg-1; with two arguments it goes from first to second-1 (and there's an optional third argument "step", which defaults to 1):

```python
>>> range(5)            # a range object (rarely useful on its own)
range(0, 5)
>>> for i in range(3):  # loop from 0 through 2
...     print(i)
0
1
2
>>> [chr(i) for i in range(65, 70, 2)]  # loop in steps of 2
['A', 'C', 'E']
>>> [i for i in range(5, 0, -1)]        # loop from 5 down to 1
[5, 4, 3, 2, 1]
```

`reversed` is again very obvious: it returns an iterator that iterates the given sequence in reverse order:

```python
>>> words = 'The Lord of the Rings'.split()
>>> ' '.join(reversed(words))
'Rings the of Lord The'
```

### Containers: `dict`, `frozenset`, `list`, `set`, and `tuple`

### Reflection: `callable`, `delattr`, `getattr`, `globals`, `hasattr`, `isinstance`, `issubclass`, `locals`, `setattr`, `type`, and `vars`

### Functional: `filter`, `map`, and `zip`

### Files: `open`

### I/O: `format`, `input`, `print`, and `repr`

### Conversion: `ascii`, `bin`, `bool`, `chr`, `float`, `hex`, `int`, `oct`, `ord`, and `str`

TODO: `bool` usually not needed, but nicer than !!

### Byte types: `bytearray`, `bytes`, and `memoryview`

### Objects: `hash`, `id`, `object`, and `super`

### Math: `abs`, `complex`, `divmod`, `max`, `min`, `pow`, `round`, and `sum`

The `sum` function is self-explanatory -- it just adds up all the numbers in the given iterable. And it can also take an optional "start" value if you don't want to start at zero:

```python
>>> sides = [1.5, 3, 1.5, 3]
>>> sum(sides)                # perimeter
9.0
>>> sum(sides) / len(sides)   # average length of a side (/ vs //)
2.25
```

TODO: min, max, including default= and key= params

### Sorting: `sorted` and `list.sort`

### Others:

* Exception hierarchy
* breakpoint, classmethod, compile, dir, eval, exec, slice, property, staticmethod



- text: re, difflib, textwrap, unicodedata, io, base64, mimetypes, gettext
- email
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

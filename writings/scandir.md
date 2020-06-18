---
layout: default
title: Contributing os.scandir() to Python
permalink: /writings/scandir/
description: My experience contributing a medium-sized feature (os.scandir) to the Python 3.5 standard library.
---
<h1>{{ page.title }}</h1>
<p class="subtitle">August 2016</p>

This article describes my experience contributing a medium-sized feature to Python. In short: I wrote [PEP 471](https://www.python.org/dev/peps/pep-0471/) and contributed [os.scandir()](https://docs.python.org/3/library/os.html#os.scandir) to the Python standard library and the CPython codebase. It was a lot more work than I expected, but it was a fun journey, and as a result the end product has a better API than my initial one.

What scandir does is provide a lowish-level API that gives the names of entries in a directory like [os.listdir()](https://docs.python.org/3/library/os.html#os.listdir), but additionally returns file type and other information without extra calls to the operating system. It's now used inside the popular [os.walk()](https://docs.python.org/3/library/os.html#os.walk) function to speed up walking directory trees by a significant amount.

To whet your appetite, here's an email a developer sent me the other day:

> "Replacing os.walk with scandir.walk sped up my recursive file search function on a Windows network in Python 2.7 from 90 seconds to 1.78 seconds. Thank you." ---Adam F

To be fair, that's on a network file system which is where you see crazy gains like 50x. However, on ordinary file systems you commonly see speedups of 5-10x, depending on OS and file system. scandir is cross-platform, so it works and gets good speed gains on Windows, Linux (actually any POSIX system), and Mac OS.


Why is scandir needed?
----------------------

Once upon a time in 2012 I was trying to figure out why walking directory trees in Python was relatively slow. I'm a Windows user, and it seemed that summing the total size of a directory using Python was a lot slower than either `dir /s` or Windows Explorer. Then I found [this very informative StackOverflow answer](http://stackoverflow.com/questions/2485719/very-quickly-getting-total-size-of-folder/2485843#2485843), including the ominous phrases "You are at a disadvantage ... Python is unfortunately not your friend in this case".

The reason is that Python's os.walk() function uses os.listdir(), which calls operating system functions to get the names of the files in a directory, and then separately makes further OS calls via os.stat() to determine whether each entry is a file or directory. And if you want to get file sizes as well, you're not done ... you have to make another OS call via os.path.getsize() or os.stat() to get the sizes of the files. That's a lot of operating system API thrashing, and calling the OS is pretty slow.

As it turns out, both Windows and Linux/Mac return the file type information in the initial OS call when getting the file names ([FindFirstFile/FindNextFile](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364418(v=vs.85).aspx) on Windows, [opendir/readdir](http://pubs.opengroup.org/onlinepubs/009695399/functions/readdir_r.html) on Linux/Mac). And on Windows, FindFirst/FindNext also return the file size and a few other things. Python's os.listdir() function fetches a whole bunch of juicy info from the OS, only to throw it away.

So I started thinking: hmmm, it should be quite easy to fix that. "Just" create a version of os.walk() which doesn't throw away the extra info. And then I thought, if this StackOverflow answer is so prominent, maybe this functionality could be added to Python itself?

Such was my entry into the CPython development process. For "process" it was. Over the next few years, on and off (and more off), I worked with the CPython core developers to get scandir included into the Python 3.5 standard library.

Here's how you might use scandir to get all the subdirectories not starting with "." in a given path:

```python
def subdirs(path):
    for entry in os.scandir(path):
        if not entry.name.startswith('.') and entry.is_dir():
            yield entry.name
```


The development timeline
------------------------

*Note: scandir was very much a part time project, and I only worked on it when I had the time and felt like it. The years-long timeline wasn't really years long.*

Most of the real action in Python development still goes on in good old mailing lists. I [first posted](https://mail.python.org/pipermail/python-ideas/2012-November/017770.html) about the idea on python-dev in November 2012 with a proof-of-concept.

Core developer Nick Coghlan [noted](https://mail.python.org/pipermail/python-ideas/2012-November/017771.html) that "It's a complex enough idea that it definitely needs some iteration outside the stdlib before it could be added ... The issue with patching the stdlib directly rather than releasing something on PyPI is that you likely won't get any design or usability feedback until the first 3.4 alpha, unless it happens to catch the interest of someone willing to tinker with a patched version earlier than that."

At this stage I was still thinking of scandir (well, it wasn't called *scandir* then) as a tiny little function added to the "os" module, so my initial thought was "why go through all that work just for a small function". But his advice was good, and there was a lot more to it than met the eye...

My first take was [betterwalk](https://github.com/benhoyt/betterwalk) in November 2012, a stand-alone module that reimplemented os.walk() using a new iterdir_stat() function with a signature like this:

```python
def iterdir_stat(path='.', pattern='*', fields=None):
    """Yield tuples of (filename, stat_result) for each filename that
    matches "pattern" in the directory given by "path". Like
    os.listdir(), '.' and '..' are skipped, and the values are yielded
    in system-dependent order.
    """
```

If I remember correctly, this was pretty much the first API I came up with. It does have the virtue of "type simplicity", in that it just uses built-in types: tuples, strings, and the existing stat_result data structure.

However, it's overly complicated. The "pattern" parameter was Windows-only (and not trivial to simulate on Linux/Mac), and the "fields" parameter was a bit of a pain. Plus, when using functions that return tuples, one always has to remember how the fields are ordered. [Nick Coghlan suggested](https://mail.python.org/pipermail/python-dev/2013-May/126148.html) using a new data type that had the name and other info accessible as attributes, so pretty soon we ended up with the concept of a rich object.

It was also pretty clear that having the function generate (yield) DirEntry objects instead of returning them as a list was better for large directories. This feature closed the separate Python [issue 11406](https://bugs.python.org/issue11406).

A lot of python-dev mailing list bits were spilled over exactly what the DirEntry objects should look like:

* Should it be a str subclass with some other attributes? No, probably a bad idea.
* Or what about a stat_result subclass with a "name" attribute? Nope.
* Making it a pathlib.Path instance looks attractive! No, wait, pathlib isn't heavily used, and more importantly, all pathlib methods like Path.stat() are guaranteed to get up-to-date data by calling the OS, which is exactly what we want to avoid...
* Okay, let's make a [lightweight DirEntry class](https://mail.python.org/pipermail/python-dev/2013-May/126148.html). We'll make the attributes and methods have the same names as the pathlib.Path one where possible.

So we've settled on DirEntry, but should the items be attributes or methods? I argued in favour of plain attributes for constant data ("name" and "path"), but methods for things that have the potential to call the OS, such as is_file() when the entry is a symlink, or when `dirent.d_type` is `DT_UNKNOWN` on Linux. I think overloading attribute access with functions that can call the OS, especially for a low-level API like scandir, is a bad idea for code clarity and error handling (why would you need to do a try/except around an innocent entry.is_file attribute access?).

There was quite a bit of discussion (in [June](https://mail.python.org/pipermail/python-dev/2014-June/thread.html) and [July](https://mail.python.org/pipermail/python-dev/2014-July/thread.html) 2014) about whether and how DirEntry objects should cache their values, and how error handling should be done.

Pretty late in the game (February 2015) the [inode() method was added](https://mail.python.org/pipermail/python-dev/2015-February/138204.html), and the follow_symlinks argument was added to the is_dir, is_file, and stat methods (defaulting to True). I'm [not the biggest fan](https://mail.python.org/pipermail/python-dev/2014-July/135448.html) of the complication introduced by the follow_symlinks argument for this low-level API, but it does mean consistency with similar os.path and [pathlib.Path](https://docs.python.org/3/library/pathlib.html) functions.


A bonus contribution
--------------------

Along the way, a [scandir user noticed](https://github.com/benhoyt/scandir/issues/22) that scandir was still throwing away some of the Windows file attributes. The stat_result structure provides quite a few Linux or Mac OS specific fields, like `st_blocks` and `st_rsize`. However, I saw several folks asking on StackOverflow about the Win32 file attributes ([for example](http://stackoverflow.com/questions/284115/cross-platform-hidden-file-detection/6365265#6365265)), which can be quite useful for things like detecting whether files are "hidden". As a Windows user myself, I wanted to fix this, and ended up [asking about it](https://mail.python.org/pipermail/python-dev/2014-June/134990.html) on python-dev and providing a small patch to CPython to make it happen: on Windows, stat_result objects now have an `st_file_attributes` member.

The code change was pretty trivial (see the few lines of C code in [this commit](https://hg.python.org/cpython/rev/706fab0213db/#l10.1)), but for a real project like CPython there's also tests and documentation, which account for well over half of the effort (and lines in the changeset). See [issue 21719](http://bugs.python.org/issue21719) for more details.

In any case, I would say if anyone wants to get started with open source contributions, a relatively tiny feature like `st_file_attributes` is a good place to start.


Enter PEP 471
-------------

After we'd pretty much settled on a good API, I was asked to write a PEP (Python Enhancement Proposal) with all the details. This clarifies the proposed API and summarizes the mailing list discussions for an official record. Each PEP gets a number (some of the numbers are a bit geek-humorous, like [PEP 404](https://www.python.org/dev/peps/pep-0404/) and [PEP 3.141](https://www.python.org/dev/peps/pep-3141/)), and the scandir PEP became [number 471](https://www.python.org/dev/peps/pep-0471/).

Writing the PEP was actually a fair bit of work in itself. There are good guidelines, but because it's an official record for the proposal you want it to be right. And it should summarize all the "rejected ideas" discussed on the mailing lists, which in scandir's case were quite a few.

I wrote the [first draft](https://mail.python.org/pipermail/python-dev/2014-June/135215.html) in June 2014, and [refined it](https://mail.python.org/pipermail/python-dev/2014-July/135377.html) in July based on python-dev feedback. Once it was done, it needed to be approved or rejected. Python BDFL Guido van Rossum appointed Victor Stinner as the "BDFL-delegate" for this PEP, and Victor [approved the PEP itself](https://mail.python.org/pipermail/python-dev/2014-July/135561.html) -- I don't think it was particularly controversial at this point. However, perhaps slightly unique was that after it was approved we went back and added the inode() method and follow_symlinks parameters later.

Note that for PEPs that describe features intended for the standard library, you need a [support section](https://www.python.org/dev/peps/pep-0471/#support) proving that you have a decent amount of support for your use case or library in the wild.

Obviously I'm a bit of a Python nerd, but reading a few PEPs is a really good way to get into the why's and wherefore's of how Python features came to be. Some examples:

* [PEP 8, Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/): well, this isn't really a Python "Enhancement" Proposal, but everyone should read and heed this one
* [PEP 237, Unifying Long Integers and Integers](https://www.python.org/dev/peps/pep-0237/): how the `long` type basically disappeared
* [PEP 238, Changing the Division Operator](https://www.python.org/dev/peps/pep-0238/): how and why the `/` operator changed its meaning in Python 3, and how `//` came to be
* [PEP 343, The "with" Statement](https://www.python.org/dev/peps/pep-0343/)
* [PEP 405, Python Virtual Environments](https://www.python.org/dev/peps/pep-0405/)
* [PEP 492, Coroutines with async and await syntax](https://www.python.org/dev/peps/pep-0492/)


Implementation
--------------

A mentioned above, I started with a proof-of-concept implementation called [betterwalk](https://github.com/benhoyt/betterwalk) that used ctypes to call the operating system functions.

After the "scandir" name and API were more or less settled, I moved things to the [scandir](https://github.com/benhoyt/scandir) repo and implemented the updated API, still using ctypes. This was a great way to get a proof of concept working without breaking out the C compiler (even less fun on Windows). But it's pretty slow: os.walk() via scandir using ctypes was already a lot faster than regular os.walk(), especially on Windows, but writing it in C gave a much bigger increase.

I'd only ever written trivial C extension code for Python before, so writing a non-trivial function required a bit of learning. For example, getting [Py_INCREF and Py_DECREF](https://docs.python.org/3/c-api/refcounting.html) reference counting right takes a bit of getting used to.

I began by implementing just the OS calls in C, and the DirEntry object creation in Python, but even that was slower than I wanted, so ended up writing the whole thing in C before too long. Fast is good!

After I'd finished writing and testing the code for CPython 3.5 (October 2014 to March 2015), I went back and updated my standalone scandir project to use the same code. I extracted the relevant portions out of the too-large [Modules/posixmodule.c](https://github.com/python/cpython/blob/master/Modules/posixmodule.c), moved it to [_scandir.c](https://github.com/benhoyt/scandir/blob/master/_scandir.c), and made a few tweaks so it could compile against Python 2.x.

From pretty early on (right from "betterwalk" days) I had a simple [benchmark script](https://github.com/benhoyt/scandir/blob/master/benchmark.py) that I and others could use to test the performance of os.walk() with and without scandir on various systems. This was invaluable to stress test the code and ensure I didn't introduce major performance regressions.

There was a little frustrating moment late in the implementation when Victor Stinner reimplemented much of scandir using a different approach (as little C code as possible), without prior discussion. And I'm sure he wouldn't mind me relating this, as it's all [on the bug tracker](http://bugs.python.org/issue22524#msg235873) and was resolved well. Victor had been helpful and involved throughout, but I was a bit frustrated at this (and said as much), and he admitted being a bit overzealous and could see how much faster the pure C implementation was.

From there it was just a matter of updating os.walk() to use scandir() instead of listdir(), and I was done ([issue 23605](https://bugs.python.org/issue23605)).

Well, not quite. At the last minute, Serhiy Storchaka [pointed out](https://bugs.python.org/issue23605#msg237779) that if a caller modifies the type of directory entries on disk while os.walk() is iterating, the new scandir-based os.walk() behaved differently (read: had a bug). The problem was, fixing this fairly fringe scenario reintroduced os.stat() calls into the code, which defeated the purpose of using scandir in the first place.

Thankfully, Serhiy Storchaka and Victor Stinner came up with a fix that, although it was sometimes slower than the incorrect version, was still a lot faster than os.walk() without scandir. Phew ... for a bit I was thinking scandir wouldn't speed up os.walk() at all.

The other piece was documentation and testing. Writing good documentation is hard: you want it to be concise but thorough, and ideally provide an example or two. I think we (Victor Stinner and I) got to a reasonably good place with the documentation for [os.scandir() and DirEntry](https://docs.python.org/3/library/os.html#os.scandir) after a couple of iterations. The slight verbosity of the DirEntry docs shows how the follow_symlinks parameter adds complexity, but I'm reasonably happy with how the docs turned out. Have a read and let me know if you have any feedback.

I had some unit tests in place for scandir already, but Victor Stinner and I moved them into the CPython source tree and added a few more. Apart from testing all the obvious things, there's the unicode vs bytes issue, and a regression test for the os.walk() issue that we'd found earlier.


In summary
----------

My main takeaways from the experience:

* It was a lot of work for a spare time project, but very rewarding for a first-time Python contributor. I've contributed a few small libraries and fixes to open source, but this is definitely the contribution I'm most proud of.
* Good APIs are important, but take a long time and a lot of bikeshedding to agree on. Bikeshedding is usually seen as a bad thing, but when something's being baked into the Python standard library, you want to get it right.
* Related to the above: naming is hard.
* Having folks like Victor Stinner and Serhiy Storchaka help out with implementation, documentation, and bug finding was invaluable.
* Python is a great language with an excellent community. The python-ideas and python-dev mailing lists, despite being very technical, are friendly and helpful places.

So going right back to [the StackOverflow answer](http://stackoverflow.com/questions/2485719/very-quickly-getting-total-size-of-folder/2485843#2485843) that started all this, after Python 3.5 was shipped, I edited the answer and added a note about this being fixed in Python 3.5 with the new os.scandir() function. It took a few years, but Python is no longer "at a disadvantage" or "not your friend".

I'll sign off with another "testimonial" that developer Bill A sent me a while back:

> I just wanted to let you know that I think scandir.walk() is *vastly* superior to the standard os.walk() function ... I scanned one directory that had over 200K files located in 5944 directories with os.walk() and it took 12 minutes to run. The same operation by scandir.walk() took 30 seconds. It was great!

So please, go ahead and share the scandir love and use it in a Python project near you! Obviously it's ideal if you're able to use Python 3.5 and use the standard library version directly, but if not, the standalone [scandir module on PyPI](https://pypi.python.org/pypi/scandir) works on Python 2.6 and above, so just `pip install scandir`!

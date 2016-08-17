---
layout: default
title: Scandir Saga
permalink: /writings/scandir-saga/index.html
---
<h1><a href="/writings/scandir-saga/">{{ page.title }}</a></h1>
<p class="subtitle">Subtitle</p>



Scandir Saga: contributing a feature to Python
==============================================

This article describes my experience contributing a medium-sized feature to Python. In short: I wrote [PEP 471](https://www.python.org/dev/peps/pep-0471/) and contributed [os.scandir()](https://docs.python.org/3/library/os.html#os.scandir) to the Python standard library and the CPython codebase. It was a lot more work than I expected, but it was a fun journey, and as a result the end product has a better API than my initial one.

What scandir does is provide a lowish-level API that provides the names of entries in a directory like [os.listdir()](https://docs.python.org/3/library/os.html#os.listdir), but additionally returns file type and other information without extra calls to the operating system. It's now used inside the popular [os.walk()](https://docs.python.org/3/library/os.html#os.walk) function to speed up walking directory trees by a significant amount.

To whet your appetite, here's an email a developer sent me the other day:

> "Replacing os.walk with scandir.walk sped up my recursive file search function on a Windows network in Python 2.7 from 90 seconds to 1.78 seconds. Thank you." ---Adam F

To be fair, that's on a network file system which is where you see crazy gains like 50x. However, on ordinary file systems you commonly see speedups of 5-10x, depending on OS and file system.


Why is scandir needed?
----------------------

Once upon a time in 2012 I was trying to figure out why walking directory trees in Python was relatively slow. I'm a Windows user, and it seemed that summing the total size of a directory using Python was a lot slower than either `dir /s` or Windows Explorer. Then I found [this very informative StackOverflow answer](http://stackoverflow.com/questions/2485719/very-quickly-getting-total-size-of-folder/2485843#2485843), including the ominous phrases "You are at a disadvantage ... Python is unfortunately not your friend in this case".

The reason is that Python's os.walk() function uses os.listdir(), which calls operating system functions to get the names of the files in a directory, and then separately makes further OS calls via os.stat() to determine whether each entry is a file or directory. And if you want to get file sizes as well, you're not done ... you have to make another OS call via os.path.getsize() or os.stat() to get the sizes of the files. That's a lot of operating system API thrashing, and calling the OS is pretty slow.

As it turns out, both Windows and Linux/Mac return the file type information in the initial OS call when getting the file names (FindFirstFile/FindNextFile on Windows, opendir/readdir on Linux/Mac). And on Windows, FindFirst/FindNext also return the file size and a few other things. Python's os.listdir() function fetches a whole bunch of juicy info from the OS, only to throw it away.

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

(Note that this timeline includes long breaks. Scandir was very much a part time project, and I only worked on it when I had the time and felt like it. The years-long timeline wasn't really years long.)

Most of the real action in Python development still goes on in good old mailing lists. I first posted about the idea [on python-dev](https://mail.python.org/pipermail/python-ideas/2012-November/017770.html) in **November 2012** with a proof-of-concept.

Core developer Nick Coghlan [noted](https://mail.python.org/pipermail/python-ideas/2012-November/017771.html) that "It's a complex enough idea that it definitely needs some iteration outside the stdlib before it could be added ... The issue with patching the stdlib directly rather than releasing something on PyPI is that you likely won't get any design or usability feedback until the first 3.4 alpha, unless it happens to catch the interest of someone willing to tinker with a patched version earlier than that."

At this stage I was still thinking of scandir (well, it wasn't called *scandir* then) as a tiny little function added to the "os" module, so my initial thought was "why go through all that work just for a small function". But his advice was good, and there was a lot more to it than met the eye...

My first take was [betterwalk](https://github.com/benhoyt/betterwalk) in **MONTH YEAR**, a stand-alone module that reimplented os.walk() using a new iterdir_stat() function with a signature like this:

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

It was also pretty clear that having the function generate (yield) DirEntry objects instead of returning them as a list was better for large directories. (This feature closed Python [issue 114066](https://bugs.python.org/issue11406).)

A lot of mailing list bits were spilled over exactly what the DirEntry objects should look like:

***LINKS***

* Should it be a str subclass with some other attributes? No, probably a bad idea.
* Or what about a stat_result subclass with a "name" attribute? Nope.
* Making it a pathlib.Path instance looks attractive! No, wait, pathlib isn't heavily used, and more importantly, all pathlib methods like Path.stat() are guaranteed to get up-to-date data by calling the OS, which is exactly what we want to avoid...
* Okay, let's make a [lightweight DirEntry class](https://mail.python.org/pipermail/python-dev/2013-May/126148.html). We'll make the attributes and methods have the same names as the pathlib.Path one where possible.

***MONTH YEAR***. So we've settled on DirEntry, but should the items be attributes or methods? I [argued](***) in favour of plain attributes for constant data (just "name" and "path"), but methods for things that have the potential to call the OS, such as is_file() when the entry is a symlink, or when the dirent.d_type is DT_UNKNOWN on Linux. I think overloading attribute access with functions that can call the OS, especially for a low-level API like scandir, is a bad idea for code clarity and error handling (why would you need to do a try/except around an innocent "entry.is_file" attribute access?).

There was quite a bit of discussion (***DATE) about whether and how DirEntry objects should cache their values, and how error handling should be done. A

Pretty late in the game (**February 2015**) the [inode() method was added](https://mail.python.org/pipermail/python-dev/2015-February/138204.html), and the follow_symlinks argument was added to the is_dir, is_file, and stat methods (defaulting to True). I'm [not the biggest fan](https://mail.python.org/pipermail/python-dev/2014-July/135448.html) of the complication introduced by the follow_symlinks argument for this low-level API, but it does mean consistency with similar os.path and [pathlib.Path](https://docs.python.org/3/library/pathlib.html) functions.


Bonus feature (a smaller contribution)
--------------------------------------

Along the way, I noticed that the stat_result structure returned quite a few Linux or Mac OS specific fields, like `st_blocks` and `st_rsize`. However, I saw several folks asking on StackOverflow about the Win32 file attributes ([for example](http://stackoverflow.com/questions/284115/cross-platform-hidden-file-detection/6365265#6365265), which can be quite useful for detecting whether files are "hidden". As a Windows user myself, I wanted to fix this, and ended up providing a small patch to CPython to make it happen: on Windows, stat_result objects now have an `st_file_attributes` member.

The code change was pretty trivial (see the few lines of C code in [this commit](https://hg.python.org/cpython/rev/706fab0213db/#l10.1)), but for a real project like CPython there's also tests and documentation, which account for well over half of the effort and of the changeset.

In any case, I would say if anyone wants to get started with open source contributions, a relatively tiny feature like `st_file_attributes` is a good place to start. See [issue 21719](http://bugs.python.org/issue21719) for more info.


Python Enhancement Proposal (PEP) 471
-------------------------------------

After we'd pretty much settled on a good API, I was asked to write a PEP (Python Enhancement Proposal) with all the details. This clarifies the proposed API and summarizes the mailing list discussions for an official record. Each PEP gets a number (some of them a bit geek-humorous, like [PEP 404](https://www.python.org/dev/peps/pep-0404/) and [PEP 3141](https://www.python.org/dev/peps/pep-3141/)), and scandir was [PEP 471](https://www.python.org/dev/peps/pep-0471/).

Writing the PEP was actually a fair bit of work in itself. There are good guidelines, but because it's an official record for the proposal you want it to be right. And it has to summarize all the "rejected ideas" discussed on the mailing lists, which in scandir's case were quite a few.

I wrote the [first draft](https://mail.python.org/pipermail/python-dev/2014-June/135215.html) in June 2014, and [refined it](https://mail.python.org/pipermail/python-dev/2014-July/135377.html) in July based on python-dev feedback. Once it was done, I needed approval. Guido van Rossum approved Victor Stinner as the "BDFL-delegate" for this PEP, and Victor [approved the PEP itself](https://mail.python.org/pipermail//python-dev/2014-July/135561.html) -- I don't think it was particularly controversial at this point. However, perhaps slightly unique was that it was after approval that we went back and added the inode() method and follow_symlinks parameters later.

Obviously I'm a bit of a Python nerd, but reading some of the PEPs is a really good way to get into the why's and wherefore's of how Python features got to be the way they are. Some examples:

* PEP *** on ***
* ***


Implementation
--------------

A mentioned above, I started with a proof-of-concept implementation called [betterwalk](https://github.com/benhoyt/betterwalk) that used ctypes to call the operating system functions.

After the scandir name and API were more or less settled, I moved things to the [scandir](https://github.com/benhoyt/scandir) repo and implemented the updated API, still in ctypes. ctypes is great to get a proof of concept working without breaking out C compilers and all of that (even less fun on Windows), but it's pretty slow -- os.walk() via scandir using ctypes was already a lot faster than regular os.walk(), especially on Windows, but writing it in C gave a much better improvement.

I'd only ever written trivial C extension code for Python before, so writing a non-trivial function required a bit of learning. Getting ***DecREF and ***IncRef reference counting right takes a bit of getting used to, for a start.

I began by implementing just the OS calls in C, and the DirEntry object creation in Python, but even that was slower than I wanted, so ended up writing the whole thing in C before too long. Speed is good!

After I'd finished writing and testing the code for CPython 3.5, I went back and updated my standalone scandir project to use the same code. I extracted the relevant portions out of the too-large Modules/posixmodule.c, moved it to _scandir.c, and made a few tweaks so it could compile against Python 2.x.

From pretty early on (right from "betterwalk" days) I had a simple [benchmark script](***) that me and other folks could use to test the performance of os.walk() with and without scandir on various systems. This was invaluable stress test the code and ensure we didn't introduce major performance regressions.

*** Little saga with V Stinner rewriting it at the last minute.

From there it was just a matter of updating os.walk() to use scandir() instead of listdir(), and I was done.

Well, not quite. At the last minute, *** [pointed out](***) that the os.walk() API allows the caller to modify "dirnames" in place, to prune or add to the tree it's walking. My scandir-based version of os.walk() had a couple of bugs when used in this way, and *** wrote a test case to reproduce it. The problem was, to fix it this fairly fringe scenario reintroduced os.stat() calls into the code, which defeated the purpose of using scandir() in the first place.

Thankfully, *** and Victor Stinner came up with a fix that, although it was slower than the buggy version, was still a lot faster than os.walk() without scandir. Phew ... for a bit I was thinking scandir wouldn't speed up os.walk() at all.


Documentation and tests
-----------------------

Writing good documentation is hard: you want it to be concise but thorough, and ideally provide an example or two. I think we (Victor Stinner and I) got to a reasonably good place with the documentation for [os.scandir() and DirEntry](***) after a couple of iterations. The slight verbosity of the DirEntry docs shows how the follow_symlinks parameter adds complexity, but I'm pretty happy with how the docs turned out. Have a read and let me know if you have any feedback (or open a documentation issue on the [Python bug tracker](***)).

I had some unit tests in place for scandir already, but Victor Stinner and I moved them into the CPython source tree and added a few more. Apart from testing all the obvious things, there's the unicode vs bytes thing, and a regression test for the os.walk() issue *** had found earlier.


In summary
----------

My main takeaways from the experience:

* It was a lot of work for a spare time project, but very rewarding for a first-time Python contributor. I've contributed a few small libraries and fixes to open source, but this is definitely the contribution I'm most proud of.
* Good APIs are important, but take a long time and a lot of bikeshedding to agree on. Bikeshedding is usually seen as a bad thing, but when something's being baked into the Python standard library, you want to get it right.
* Related to the above: naming is hard.
* Having folks like Victor Stinner and *** help out with implementation, documentation, and bug finding was invaluable.
* Python is a great language with an excellent community. The python-ideas and python-dev mailing lists, despite being very technical, are friendly and helpful places.

So going right back to [the StackOverflow answer](http://stackoverflow.com/questions/2485719/very-quickly-getting-total-size-of-folder/2485843#2485843) that started all this, after Python 3.5 was shipped, I edited the answer and added a note about this being fixed in Python 3.5 with the new os.scandir() function. It took a few years, but Python is no longer "at a disadvantage" or "not your friend".

So please, go ahead and share the scandir love and use it in a Python project near you! Obviously it's ideal if you're able to use Python 3.5 and use the standard library version directly, but if not, just "pip install scandir" -- the standalone module works on Python 2.6 *** and above.

I'll sign off with another "testimonial" *** sent me a while back: ***

---
title: CherryPy, ctypes, and being explicit
layout: default
permalink: /writings/cherrypy-ctypes-and-being-explicit/
description: Details a bug in CherryPy on Windows due to lack of ctypes argument types
canonical_url: http://tech.oyster.com/cherrypy-ctypes-and-being-explicit/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">October 2011</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

Here at [Oyster.com][2] part of our web stack consists of [web.py][3] and [CherryPy][1], and on the whole we&#8217;ve found they&#8217;re fast and stable. However, a little while ago, the CherryPy server started intermittently raising an exception and bombing out &#8212; a WindowsError due to an invalid handle on an [obscure SetHandleInformation() call][4].

![CherryPy web framework logo](/images/cherrypy_logo_big.png)

## Auto-restart is not a solution

At first this was only happening once in a very long while, but after certain changes it would start happening a few times a day. We&#8217;ve got a script in place that restarts our servers when they die, but because of the aggressive caching we do, our web servers load tons of stuff from the database on startup, and hence take a while to load. So just letting our auto-restart scripts kick in wasn&#8217;t a solution.

On further digging, we found there was already a [relevant CherryPy bug open][5], with someone else getting the same intermittent exception. They were working around it by changing an unrelated line of code, so something smelled fishy.

## HANDLE != uint32

I noticed SetHandleInformation() was being called with [ctypes][6], and had just recently been using ctypes for a [named mutex class][7] I&#8217;d written (to make Python&#8217;s logging module safe for writes from multiple processes).

ctypes is great for calling C DLLs when you just want a thin Python-to-C wrapper. Its defaults are good — for instance, Python integers get converted to 32-bit ints in C, which is normally what you want. [SetHandleInformation()&#8217;s first parameter][8] is a handle, which I (and apparently CherryPy) assumed was just an integer, so it was getting passed to C as a 32-bit value. However, it&#8217;s actually defined as a HANDLE, which is typed as void pointer, so on our 64-bit Windows machines it was actually a 64-bit value.

SetHandleInformation() was looking for the high 32 bits of the handle on the stack or in a register someone else owned, and of course sometimes those 32 undefined bits weren&#8217;t zero. Crash bang.

## On being explicit

Once we realized what was happening, the fix was easy enough &#8212; ctypes lets you override the default conversions by specifying argument and return types explicitly. So we changed a straight ctypes call:

```python
windll.kernel32.SetHandleInformation(sock.fileno(), 1, 0)
```

to a ctypes call with an explicit type spec, like this:

```python
SetHandleInformation = windll.kernel32.SetHandleInformation
SetHandleInformation.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.DWORD]
SetHandleInformation.restype = wintypes.BOOL
SetHandleInformation(sock.fileno(), 1, 0)
```

Lo and behold, we were now telling ctypes to respect the function&#8217;s signature, and everything worked fine. We told the CherryPy folks and they were quick to [implement this fix][9] and resolve the bug.

So don&#8217;t be scared of ctypes, but just remember, it doesn&#8217;t memorize Windows.h, so avoid pain and suffering by telling it your types. *Explicit* isn&#8217;t for raunchy movies &#8212; it&#8217;s point #2 in the [Zen of Python][10].

 [1]: http://cherrypy.org/
 [2]: http://www.oyster.com/
 [3]: http://webpy.org/
 [4]: https://bitbucket.org/cherrypy/cherrypy/src/9c2d91cac2e8/cherrypy/wsgiserver/wsgiserver2.py#cl-1576
 [5]: https://bitbucket.org/cherrypy/cherrypy/issue/1016/windowserror-error-6-the-handle-is-invalid
 [6]: http://docs.python.org/library/ctypes.html
 [7]: http://code.activestate.com/recipes/577794-win32-named-mutex-class-for-system-wide-mutex/
 [8]: http://msdn.microsoft.com/en-us/library/windows/desktop/ms724935(v=vs.85).aspx
 [9]: https://bitbucket.org/cherrypy/cherrypy/changeset/102ee9f08271
 [10]: http://www.python.org/dev/peps/pep-0020/
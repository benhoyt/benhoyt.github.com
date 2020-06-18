---
title: 'OpenSSL hangs CPU with Python <= 2.7.3 on Windows'
layout: default
permalink: /writings/openssl-python-windows/
description: Details a serious bug in an older version of OpenSSL that causes O(N^2) behaviour
canonical_url: http://tech.oyster.com/openssl-python-windows/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2013</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

If you use Python on Windows and you have programs or servers which allocate a lot of items on the heap (both of which we do), you should upgrade to Python 2.7.4. Especially if you do anything with HTTPS/SSL connections.

Python versions 2.7.3 and below use an older version of OpenSSL, which has a [serious bug][1] that can cause minutes-long, CPU-bound hangs in your Python process. Apart from the process taking over your CPU, the symptom we saw was a `socket.error` with the message &#8220;[Errno 10054] An existing connection was forcibly closed by the remote host&#8221;. This is because the HTTPS request is opened before the OpenSSL hang kicks in, and it takes so long that the remote server times out and closes the connection.

The cause of the bug is actually quite arcane: the Windows version of OpenSSL uses a Win32 function called Heap32Next to walk the heap and generate random data for cryptographic purposes.

However, a call to Heap32Next is O(N) if there are N items in the heap, so *walking the heap* is an O(N<sup>2</sup>) operation! Of course, if you&#8217;ve got [10 million items on the heap][2], this takes about 5 minutes. The first connection to an HTTPS server (which uses OpenSSL) essentially brings Python to a grinding halt for this time.

There&#8217;s a workaround: call the [`ssl.RAND_status()`][3] function on startup, before you&#8217;ve allocated the big data on your heap. That seemed to fix it, though we didn&#8217;t dig too deep to guarantee the fix. We were still running on Python 2.6, and given that the just-released 2.7.4 addressed this issue by using a newer version of OpenSSL, we fixed this by simply upgrading to Python 2.7.4. Note that even Python 2.7.3 has the older version of OpenSSL, so be careful.

Other interesting things we found while hunting down this bug:

  * At first we thought this was a bug in Python&#8217;s SSL handling, and it turns out there&#8217;s a <a href="http://bugs.python.org/issue5103">strangely similar bug</a> in Python 2.6&#8217;s SSL module. This was interesting, but it wasn&#8217;t our problem.
  * Microsoft&#8217;s Raymond Chen has a very good [historical explanation][4] of why walking the heap with Heap32Next is O(N<sup>2</sup>), and why OpenSSL shouldn&#8217;t really be using this function.
  * You can reproduce the Heap32Next hang just by allocating a ton of Python objects (eg: `x = [{i: i} for i in range(500000)]`) and seeing the first HTTPS request take ages, with the CPU sitting at around 100%.
  * A [blog post][5] with graphs showing Heap32Next&#8217;s O(N) behaviour, as well as the connection to OpenSSL.
  * [What&#8217;s new in Python 2.7.4][6] notes the update to the bug-fixed OpenSSL version 0.9.8y on Windows.
  * This is the second bug we&#8217;ve found due to running something of an eccentric architecture (6GB of website data cached in Python dicts). The other one was related to [garbage collection][2], and incidentally the handling of that was [improved in Python 2.7][7] too. Yes, I know, somebody will leave a comment about how we should be using memcached for this, and they&#8217;d probably be right, except for [this][8]. :-)

 [1]: http://rt.openssl.org/Ticket/Display.html?id=2100&user=guest&pass=guest
 [2]: http://tech.oyster.com/pythons-garbage-collector/
 [3]: http://docs.python.org/2/library/ssl.html#ssl.RAND_status
 [4]: http://blogs.msdn.com/b/oldnewthing/archive/2012/03/23/10286665.aspx
 [5]: http://thenewjamesbaker.blogspot.co.nz/2009/11/performance-of-heap32next-on-64-bit.html
 [6]: http://hg.python.org/cpython/file/9290822f2280/Misc/NEWS
 [7]: http://docs.python.org/dev/whatsnew/2.7.html#optimizations
 [8]: http://www.joelonsoftware.com/articles/fog0000000069.html
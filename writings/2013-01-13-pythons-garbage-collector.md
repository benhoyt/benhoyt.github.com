---
title: 'An arm wrestle with Python&#8217;s garbage collector'
layout: default
permalink: /writings/pythons-garbage-collector/
description: How we eliminated 4.5 second stop-the-world GC pauses in Python's garbage collector
canonical_url: http://tech.oyster.com/pythons-garbage-collector/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">January 2013</p>

> [Original article on tech.oyster.com]({{ page.canonical_url }})

Most of Oyster.com is powered by Python and [web.py][1], but &#8212; perhaps surprisingly &#8212; this is the first time we&#8217;ve had to think about garbage collection. Actually, I think the fact that we&#8217;ve only run into this issue after several years on the platform is pretty good. So here&#8217;s the saga&#8230;

## Observing a system alters its state

It started when we noticed a handful of &#8220;upstream connection refused&#8221; lines in our nginx error logs. Every so often, our Python-based web servers were not responding in a timely fashion, causing timeouts or errors for about 0.2% of requests.

Thankfully I was able to reproduce it on my development machine &#8212; always good to have a nice, well-behaved bug. I had just narrowed it down to our template rendering, and was about to blame the [Cheetah][2] rendering engine, when all of a sudden the bug moved to some other place in the code. Drat, a [Heisenbug][3]!

## But not at all random

It wasn&#8217;t related to rendering at all, of course, and after pursuing plenty of red herrings, I noticed it was happening not just randomly across 0.2% of requests, but (when hitting only our homepage) exactly every 445 requests. On such requests, it&#8217;d take 4.5 seconds to render the page instead of the usual 15 milliseconds.

But it can&#8217;t be garbage collection, I said to myself, because Python uses simple, predictable [reference counting][4] for its garbage handling. Well, that&#8217;s true, but it also has a &#8220;real&#8221; [garbage collector][5] to supplement the reference counting by detecting reference cycles. For example, if object A refers to object B, which directly or indirectly refers back to object A, the reference counts won&#8217;t hit zero and the objects will never be freed &#8212; that&#8217;s where the collector kicks in.

Sure enough, when I [disabled][6] the supplemental GC the problem magically went away.

## A RAM-hungry architecture

Stepping back a little, I&#8217;ll note that we run a slightly unusual architecture. We cache the entire website and all our page metadata in local Python objects (giant dict objects and other data structures), which means each server process uses about 6GB of RAM and allocates about 10 million Python objects. This is loaded into RAM on startup &#8212; and yes, allocating and creating 10M objects [takes a while][7]. You&#8217;re thinking there are almost certainly [better ways][8] to do that, and you&#8217;re probably right. However, we made a speed-vs-memory tradeoff when we designed this, and on the whole it&#8217;s worked very well for us.

But when the garbage collector does decide to do a full collection, which happened to be every 445 requests with our allocation pattern, it has to linearly scan through all the objects and do its GC magic on them. Even if visiting each object takes only a couple hundred nanoseconds, with 10 million objects that adds up to multiple seconds pretty quickly.

## Our solution

So what&#8217;s the solution? We couldn&#8217;t just disable the GC, as we do have some reference cycles that need to be freed, and we can&#8217;t have that memory just leaking. But it&#8217;s a relatively small number of objects, so our short-term fix was to simply to bump up the [collection thresholds][9] by a factor of 1000, reducing the number of full collections so they happen only once in a blue moon.

![Response time (ms) vs time, before and after the fix](/images/graph21.png)

The longer-term, &#8220;correct&#8221; fix (assuming we decide to implement it) will be to wait till the [GC counts][10] near the thresholds, then temporarily stop the process receiving requests and do a [manual collection][11], and then start serving again. Because we have many server processes, nginx will automatically move to the next process if one of them&#8217;s not listening due to this full garbage collection.

One other thing we discovered along the way is that we can disable the GC when our server process starts up. Because we allocate and create so many objects on startup, the GC was actually doing many (pointless) full collections during the startup sequence. We now disable the collector while loading the caches on startup, then re-enable it once that&#8217;s done &#8212; this cut our startup time to about a third of what it had been.

## To sum up

In short, when you have millions of Python objects on a long-running server, tune the garbage collector thresholds, or do a manual gc.collect() with the server out of the upstream loop.

 [1]: http://webpy.org/
 [2]: http://www.cheetahtemplate.org/
 [3]: http://en.wikipedia.org/wiki/Heisenbug
 [4]: http://docs.python.org/2/c-api/intro.html#reference-counts
 [5]: http://docs.python.org/2/library/gc.html
 [6]: http://docs.python.org/2/library/gc.html#gc.disable
 [7]: http://stackoverflow.com/questions/4195202/how-to-deserialize-1gb-of-objects-into-python-faster-than-cpickle
 [8]: http://memcached.org/
 [9]: http://docs.python.org/2/library/gc.html#gc.set_threshold
 [10]: http://docs.python.org/2/library/gc.html#gc.get_count
 [11]: http://docs.python.org/2/library/gc.html#gc.collect
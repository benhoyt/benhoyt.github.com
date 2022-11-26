---
layout: default
title: "I/O is no longer the bottleneck"
permalink: /writings/io-is-no-longer-the-bottleneck/
description: "In 2022, disk I/O is very fast, and not usually the performance bottleneck in programs. This article digs into some numbers."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2022</p>


When interviewing programmers, I often ask them to code a simple program to count word frequencies in a text file. It's a good problem that tests a bunch of skills, and with some follow-up questions, allows you to go surprisingly deep.

One of the follow-up questions I ask is, "What's the performance bottleneck in your program?" Most people say something like "reading from the input file".

In fact, I was inspired to write this article after responding to someone on Gopher Slack, who said, "I also note there's a lot of extra work happening here in splitting the entire line, etc, it's just that typically this is all so much faster than I/O that we don't care."

I'm not picking on him ... before I [analyzed the performance](/writings/count-words/) of the count-words problem, I thought the same. It's what we've all been taught, right? "I/O is slow."

Not anymore! Disk I/O may have been slow 10 or 20 years ago, but in 2022, **reading a file sequentially from disk is very fast.**

Just how fast? I tested the read and write speed of my development laptop using [this method](https://www.shellhacks.com/disk-speed-test-read-write-hdd-ssd-perfomance-linux/) but with `count=4096` so we're reading and writing 4GB. Here are the results on my Dell XPS 13 with a Samsung PM9A1 NVMe drive, running Ubuntu 22.04:

| I/O Type                | Speed (GB/s) |
| ----------------------- | -------------:
| Read (not cached)       | 1.7          |
| Read (cached)           | 10.8         |
| Write (incl. sync time) | 1.2          |
| Write (not incl. sync)  | 1.6          |

System calls are relatively slow, of course, but when reading or writing sequentially you only have to do one syscall every 4KB, or 64KB, or whatever your buffer size is. And I/O over a network is still slow, especially a non-local network.

So what *is* the bottleneck in a program that counts word frequencies like the one above? It's processing or parsing the input and the associated memory allocations: splitting the input into words, converting to lowercase, and counting frequencies with a hash table.

I modified my Python and Go count-words programs to record the times of the various stages of the process: reading the input, processing (the slow part), sorting by most frequent, and outputting. I'm running it on a 413MB text file, so it's a decent amount of input (100 concatenated copies of the [text of the King James Bible](https://www.gutenberg.org/cache/epub/10/pg10.txt)).

Below are the results, in seconds, from the best of 3 runs:

| Stage       | Python | Go (simple) | Go (optimized) |
| ----------- | -------: ------------: ---------------:
| Reading     | 0.384  |       0.499 |          0.154 |
| Processing  | 7.980  |       3.492 |          2.249 |
| Sorting     | 0.005  |       0.002 |          0.002 |
| Outputting  | 0.010  |       0.009 |          0.010 |
| **Total**   | 8.386  |       4.000 |          2.414 |

The sorting and outputting is negligible here: because the input is 100 copies, the number of unique words is comparatively low. Side note: this makes another interesting follow-up question in interviews. Some candidates say that sorting is going to be the bottleneck, because it's O(N log N) rather than the input processing, which is O(N). However, it's easy to forget we're dealing with two different N's: the total number of words in the file, and the number of unique words.

The guts of the [Python version](https://github.com/benhoyt/io-performance/blob/master/simple.py) boil down to a few lines of code:

```python
content = sys.stdin.read()
counts = collections.Counter(content.lower().split())
most_common = counts.most_common()
for word, count in most_common:
    print(word, count)
```

You can easily read line-by-line in Python, but it's a bit slower, so here I'm just reading the whole file into memory and processing it at once.

The [simple Go version](https://github.com/benhoyt/io-performance/blob/master/simple.go) takes the same approach, though Go's standard library doesn't have [`collections.Counter`](https://docs.python.org/3/library/collections.html#collections.Counter), so we have to do the "most common" sorting ourselves.

The [optimized Go version](https://github.com/benhoyt/io-performance/blob/master/optimized.go) is significantly faster, but also quite a lot more complicated. We're avoiding most memory allocations by converting to lowercase and splitting on word boundaries *in place*. That's a good rule of thumb for optimizing CPU-bound code: reduce memory allocations. See my [count-words optimization article](/writings/count-words/) for how to profile this.

I haven't shown an optimized Python version because it's hard to optimize Python much further! (I got the time down from 8.4 to 7.5 seconds). It's as fast as it is because the core operations are happening in C code -- that's why it so often doesn't matter that "Python is slow". 

As you can see, the disk I/O in the simple Go version takes only 14% of the running time. In the optimized version, we've sped up both reading and processing, and the disk I/O takes only 7% of the total.

My conclusion? If you're processing "big data", disk I/O probably isn't the bottleneck. A little bit of measurement will likely point to parsing and memory allocation.


{% include sponsor.html %}

---
layout: default
title: "Go performance from version 1.0 to 1.22"
permalink: /writings/go-version-performance-2024/
description: "Shows how much the performance of Go has improved from version 1.0 through to 1.22 (including PGO) -- in its compiler, runtime, and libraries."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">April 2024</p>


Two years ago I [compared](/writings/go-version-performance/) two different benchmarks of my [GoAWK interpreter](https://github.com/benhoyt/goawk) on all the versions of Go from 1.2 through 1.18. 

In this article I re-run those benchmarks, adding the missing Go versions (1.0 and 1.1) as well as the new versions (1.19 through 1.22). I also include results with profile-guided optimisation (PGO), which was added in Go 1.20. I'll quote a fair bit from my original article so you don't have to re-read the old one to understand the setup.

There are many ways programs written in Go have gotten faster: the Go team and external contributors have improved the compiler and have optimized the runtime, garbage collector, and standard library. Here we compare GoAWK's performance when compiled using each released version of Go from 1.0 through 1.22 -- the latest at the time of writing.

I tested this by running GoAWK on two AWK programs which represent different extremes of what you can do with AWK: I/O with string processing, and number crunching.

First we have `countwords`, a string processing task that counts the frequencies of words in the input and prints out the words with their counts. This is the kind of thing that's typical for an AWK script. The input is a 10x concatenated version of the King James Bible (which I've [used before](/writings/count-words/) for performance comparisons). Here's the code:

```awk
{
    for (i=1; i<=NF; i++)
        counts[tolower($i)]++
}

END {
    for (k in counts)
        print k, counts[k]
}
```

The second program is `sumloop`, a tight loop that adds the loop counter to a variable a bunch of times. This one's not really a typical use of AWK, but makes for a good test of the GoAWK bytecode interpreter loop:

```awk
BEGIN {
    for (i=0; i<10000000; i++)
        sum += i+i+i+i+i
}
```

I had to tweak GoAWK's code slightly to get it to compile on older Go versions. In particular for Go 1.0, because it doesn't have [`bufio.Scanner`](https://pkg.go.dev/bufio#Scanner), and GoAWK uses that heavily. I used the Go 1.1 implementation of `bufio.Scanner` for 1.0.

The timing numbers in the chart are the time in seconds on my x86-64 Linux laptop (best of three runs). The blue line is `countwords` and the red line is `sumloop` (incidentally, I had mis-labelled the results last time). Note that **the Y axis is logarithmic** this time, in an effort to see the more subtle improvements in recent versions more clearly.

Also included on the chart are the GoAWK binary sizes for each Go version -- that's the light grey line.

Once again, I used a [Python script](https://gist.github.com/benhoyt/50eea688bc8de697218fe982488e2467) to run them all and measure the timings. Here is the chart (or [as a table](https://gist.github.com/benhoyt/c9e1db52103e88c725facce4361c8a26) if you prefer):

![GoAWK speed across Go versions](/images/goawk-speed-2024.png)

**The biggest improvements come in versions 1.3, 1.5, 1.7, and 1.12.** After that, it's very gradual speedups -- all the low-hanging fruit has long since been picked.

This time there was a **strange bump for `countwords` in Go 1.2**: it went from 7.5s in 1.1 to 25.5s in 1.2 (!), and then down to 2.8s in 1.3. This is almost certainly caused by the [stack "hot split" issue](https://docs.google.com/document/d/1wAaf1rYoM4S4gtnPh0zOlGzWtrZFQ5suE8qr2sD8uWQ/pub) which was [fixed in 1.3](https://go.dev/doc/go1.3#stacks) due to the Go team changing "the implementation of goroutine stacks away from the old, 'segmented' model to a contiguous model."

I figured out the cause of the 1.2 anomaly by profiling, and noticing that runtime stack operations made up a huge percentage of the running time. Here's the first few lines of the `pprof` output:

```
$ go tool pprof --text ./goawk_1.2 go12.prof 
Total: 1830 samples
     332  18.1%  18.1%      332  18.1% runtime.newstack
     296  16.2%  34.3%      296  16.2% runtime.memclr
     281  15.4%  49.7%      281  15.4% runtime.oldstack
     222  12.1%  61.8%      619  33.8% github.com/benhoyt/goawk/interp.(*interp).execute
      91   5.0%  66.8%       91   5.0% runtime.lessstack
      75   4.1%  70.9%      133   7.3% github.com/benhoyt/goawk/interp.(*interp).callBuiltin
      57   3.1%  74.0%       57   3.1% runtime.stackfree
      53   2.9%  76.9%       81   4.4% strings.FieldsFunc
      ...
```

**PGO improves the performance by only a few percent,** about 2% for `countwords` and 7% for `sumloop` using Go 1.22. I compile the released GoAWK binaries with PGO.

**Binary size has remained fairly stable over the years**, apart from the large bump in 1.2. Even with PGO enabled, binaries are only about 5% bigger, so I think it's normally worth it.

Overall, `countwords` is now about 8x as fast as it would have been with Go 1.0, and `sumloop` is 24x as fast. Thanks, Go team, for all your hard work over the years!


{% include sponsor.html %}

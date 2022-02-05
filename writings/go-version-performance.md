---
layout: default
title: "Go performance from version 1.2 to 1.18"
permalink: /writings/go-version-performance/
description: "Shows how much the performance of Go has improved from version 1.2 through to 1.18 -- in its compiler, runtime, and libraries."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2022</p>


Recently I improved the performance of [GoAWK](https://github.com/benhoyt/goawk) -- my AWK interpreter written in Go -- by [switching](/writings/goawk-compiler-vm/) from a tree-walking interpreter to a bytecode compiler with a virtual machine interpreter.

While doing that, I thought it'd be interesting to see how much the performance of Go itself has improved over the years.

There are many ways programs written in Go have gotten faster: the Go team and external contributors have improved the compiler and have optimized the runtime, garbage collector, and standard library. Below is a comparison of GoAWK's performance when compiled using each released version of Go from 1.2 (the earliest version I could download) to 1.18 (which is in beta now).

I tested by running GoAWK on two AWK programs which represent different extremes of what you can do with AWK: I/O and string processing, and number crunching.

First, `countwords`, a string processing task that counts the frequencies of words in the input and prints out the words with their counts. This is the kind of thing that's typical for an AWK script. The input is a 10x concatenated version of the King James Bible (which I've [used before](/writings/count-words/) for performance comparisons) Here's the code:

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

The second program is `sumloop`, a tight loop that adds the loop counter to a variable a bunch of times. This one's not really a typical use of AWK:

```awk
BEGIN {
    for (i=0; i<10000000; i++)
        sum += i+i+i+i+i
}
```

The timing numbers in the first chart are the time in seconds on my x86-64 Linux laptop (best of three runs). I've also included a chart of the GoAWK binary size for each Go version.

I used a [Python script](https://github.com/benhoyt/goawk/blob/290c573830ec721ed39457cccd0071ac3929d142/goversions.py) to run them all and measure the timings. Here are the charts (or [as a table](https://github.com/benhoyt/goawk/blob/290c573830ec721ed39457cccd0071ac3929d142/goversions.txt) if you prefer):

![GoAWK speed across Go versions](/images/goawk-speed.png)

![GoAWK binary size across Go versions](/images/goawk-binary-size.png)

I guess there was some low-hanging fruit they picked way back in Go version 1.3! The [release doc](https://go.dev/doc/go1.3#impl) says there were significant changes to the runtime, garbage collector, and how stacks were handled. Then there are steady improvements for `countwords` up through Go 1.7 and for `sumloop` up through 1.9. After that there are very gradual improvements up to 1.18, where we are today.

Without digging in too much, my guess is that the improvements to `countwords` (at least after 1.3) are mainly due to improvements in the standard library, whereas the improvements in "CPU bound" `sumloop` are due to optimizations in the compiler.

A recent improvement was in version 1.17, which [passes function arguments and results in registers](https://menno.io/posts/golang-register-calling/) instead of on the stack. This was a *significant* improvement for GoAWK's old tree-walking interpreter, where I [saw](https://groups.google.com/g/golang-nuts/c/rHLMH2wHi8U/m/oW73wnEZBgAJ) a 38% increase in speed on one microbenchmark, and a 17% average speedup across all microbenchmarks.

Interestingly, with GoAWK's new virtual machine implementation, there's no noticeable improvement from the change to pass arguments in registers. This is because the virtual machine uses a big `switch` statement to dispatch the different opcodes, but very few function calls. This is in contrast to the tree-walking interpreter, where every expression required a (recursive) function call to `eval`, so it did get large performance gains.

<details><summary markdown="span">Expand this to see benchmark results on the old tree-walking interpreter ([table](https://github.com/benhoyt/goawk/blob/c996205385d64767486753ad54d6000a998eff9d/goversions.txt)). It follows much the same trajectory, though you can see the jump down at 1.17 due to the register calling change.</summary>

![GoAWK speed across Go versions with tree-walking interpreter](/images/goawk-speed-tree-walking.png)

</details>

I'm looking forward to someone improving the performance of Go's `regexp` package, which is [quite slow](https://github.com/golang/go/issues/26623). Regular expressions are used heavily in AWK scripts, so this would make a big difference when using GoAWK for real-world scripts. Maybe I'll have a crack at this myself sometime.

Overall, `countwords` is now about 5x as fast as it would have been with Go 1.2, and `sumloop` is 14x as fast! (Though I first released GoAWK when Go was already at version 1.11, so it wasn't around for the huge early gains.)

For an actively-developed compiler like Go, it's cool to be able to get performance improvements just by *waiting* and letting others do all the hard work. :-)


{% include sponsor.html %}

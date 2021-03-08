---
layout: default
title: "Performance comparison: counting words in Go, Python, C, C++, and AWK"
permalink: /writings/count-words/
description: "Performance comparison of counting and sorting word frequencies in various languages (Go, Python, C, C++, and AWK)"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2021</p>

<!--
Add other languages?
* bare bash / unix tools (split into words, sort, uniq -c, sort)
-->


> Summary: I describe a simple interview problem (counting frequencies of unique words), solve it in various languages, and compare performance across them. For each language, I've included a simple, idiomatic solution as well as a more optimized approach via profiling.
>
> **Go to:** [Problem](TODO) \| [Python](#python) \| [Go](#go) \| [Numbers](TODO) \| [Learnings](TODO)


At a previous company I conducted many coding interviews, and one of the questions I liked to ask was this:

> Write a program to count the frequencies of unique words, and then print them out with their frequencies, ordered most frequent first. For example, given this input:
>
>     The foo the foo the
>     defenestration the
>
> The program should print the following:
>
>     the 4
>     foo 2
>     defenestration 1

As an aside, the reason I think this is a good interview question is that it's somewhat harder to solve at a basic level than [FizzBuzz](https://blog.codinghorror.com/why-cant-programmers-program/), yet it doesn't suffer from the "invert a binary tree on this whiteboard" issue. It's the kind of thing a programmer might have to write a script for in real life, and it shows whether they understand file I/O, hash tables (maps), and how to use their language's `sort` function. There's a little bit of trickiness in the sorting part, because most hash data structures aren't ordered, and if they are, it's by key and not by value.

After the candidate has a basic solution, you can push it in all sorts of different directions: what about capitalization? punctuation? how does it order two words with the same frequency? what's the performance bottleneck likely to be? how does it fare in terms of big-O? what's the memory usage? roughly how long would your program take to process a 1GB file? would your solution still work for 1TB? and so on. Or you can take it in a "software engineering" direction and talk about error handling, testability, turning it into a hardened command line program, etc.

A basic solution reads the file line-by-line, parses each line into words, and counts the frequencies in a hash table. When it's done that, it converts the hash table to a list of key-value pairs, sorts by value (largest first), and finally prints them out. We'll assume it normalizes to lowercase (per the example above), and ignores punctuation.

In Python, one obvious solution using a plain `dict` might look like this (imports elided):

```python
counts = {}
for line in sys.stdin:
    words = line.lower().split()
    for word in words:
        counts[word] = counts.get(word, 0) + 1

pairs = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
for word, count in pairs:
    print(word, count)
```

If the candidate was a Pythonista, they might use `collections.defaultdict` or even `collections.Counter` -- see below for code using the latter. In that case I'd ask them how it worked under the hood, or how they might do it with a plain dictionary.

In any case, I've been playing with this problem for a while now, and I wanted to see what the performance would be like in various languages, both with a simple idiomatic solution and with a slightly more optimized version (without getting crazy about it).


## Problem statement and constraints

Each program needs to read from standard input or from a file, and print the frequencies of unique, space-separated words in the file, in order from most frequent to least frequent, as per the example above. To keep our solutions simple and consistent, here are the (self-imposed) constraints I'm working against:

* Normalize: the program must normalize words to lowercase, so "The the" should appear as "the 2" in the output.
* Words: anything separated by whitespace -- ignore punctuation. This does make the program less useful, but I don't want to this to become a tokenization battle.
* ASCII: it's okay to only support ASCII for the whitespace handling and lowercase operation. Most of the optimized variants do this.
* Ordering: if the frequency of two words is the same, their order in the output doesn't matter.
* Threading: it should run in a single thread on a single machine.
* Memory: don't read whole file in memory. Buffering it line-by-line is okay, or in chunks with a maximum buffer size of 64KB.
* Map: however, it's okay to keep the whole word-count map in memory. We're assuming the input is text in a real language, not full of randomized unique words.
* Text: assume that the input file is text, with "reasonable" length lines shorter than the buffer size.
* Safe: even for the optimized variants, don't use unsafe features of the language, nor drop down to C or assembly.
* Stdlib: only use the language's standard library functions. Writing a custom hash table for the counting may speed things up, but I'm considering it out of scope here. (Though it's not actually too hard -- see my [counter](https://github.com/benhoyt/counter) package.)

Our input file will be the text of the King James version of the Bible, copied ten times. I sourced this [from Gutenberg.org](https://www.gutenberg.org/ebooks/10), replaced smart quotes with the ASCII quote character, and used `cat` to multiply it by ten to get the 43MB reference input file.

So let's get coding! The solutions below are in the order I solved them.


## Python

An idiomatic Python version would probably use `collections.Counter` (Python's collections library is really nice -- thanks Raymond Hettinger!). It's about as simple as you can get:

```python
counts = collections.Counter()
for line in sys.stdin:
    words = line.lower().split()
    counts.update(words)

for word, count in counts.most_common():
    print(word, count)
```

This is Unicode-friendly and is probably what I'd write in "real life". It's actually quite efficient, because all the low-level stuff is really done in C: reading the file, converting to lowercase and splitting on whitespace, updating the counter, and the sorting that `Counter.most_common` does.

But let's try to optimize! Python comes with a [profiling module](https://docs.python.org/3/library/profile.html) called `cProfile`. It's easy to use -- simply run your program using `python3 -m cProfile`. I've commented out the final `print` call to avoid the profiling output mixing with the program's output -- it's fairly negligible anyway. Here's the output (`-s tottime` sorts by total time in each function):

```
$ python3 -m cProfile -s tottime simple.py <kjvbible_x10.txt
         6997799 function calls (6997787 primitive calls) in 3.872 seconds

   Ordered by: internal time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
   998170    1.361    0.000    1.361    0.000 {built-in method _collections._count_elements}
        1    0.911    0.911    3.872    3.872 simple.py:1(<module>)
   998170    0.415    0.000    0.415    0.000 {method 'split' of 'str' objects}
   998171    0.405    0.000    2.388    0.000 __init__.py:608(update)
   998170    0.270    0.000    0.622    0.000 {built-in method builtins.isinstance}
   998170    0.182    0.000    0.351    0.000 abc.py:96(__instancecheck__)
   998170    0.170    0.000    0.170    0.000 {built-in method _abc._abc_instancecheck}
   998170    0.134    0.000    0.134    0.000 {method 'lower' of 'str' objects}
     5290    0.009    0.000    0.018    0.000 codecs.py:319(decode)
     5290    0.009    0.000    0.009    0.000 {built-in method _codecs.utf_8_decode}
        1    0.007    0.007    0.007    0.007 {built-in method builtins.sorted}
      7/1    0.000    0.000    0.000    0.000 {built-in method _abc._abc_subclasscheck}
        1    0.000    0.000    0.007    0.007 __init__.py:559(most_common)
        1    0.000    0.000    0.000    0.000 __init__.py:540(__init__)
        1    0.000    0.000    3.872    3.872 {built-in method builtins.exec}
      7/1    0.000    0.000    0.000    0.000 abc.py:100(__subclasscheck__)
        7    0.000    0.000    0.000    0.000 _collections_abc.py:392(__subclasshook__)
        1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}
        1    0.000    0.000    0.000    0.000 {method 'items' of 'dict' objects}
```

We can see a number of things here:

* 998,170 is the number of lines in the input, and because we're reading line-by-line, we're calling functions and executing the Python loop that many times.
* The large amount of time spent in `simple.py` itself shows how (relatively) slow it is to execute Python bytecode -- the main loop is pure Python, again executed 998,170 times.
* `str.split` is relatively slow, presumably because it has to allocate and copy many strings.
* `Counter.update` calls `isinstance`, which adds up. I thought about calling the C function `_count_elements` directly, but that's an implementation detail and I decided it fell into the "unsafe" category.

The main thing we need to do is reduce the number of times around the main Python loop, and hence reduce the number of calls to all those functions. So let's read it in 64KB chunks:

```python
counts = collections.Counter()
remaining = ''
while True:
    chunk = sys.stdin.read(64*1024)
    if not chunk:
        break
    chunk = remaining + chunk
    last_lf = chunk.rfind('\n')
    if last_lf == -1:
        remaining = ''
    else:
        remaining = chunk[last_lf+1:]
        chunk = chunk[:last_lf]
    counts.update(chunk.lower().split())

for word, count in counts.most_common():
    print(word, count)
```

Instead of our main loop processing 42 characters at a time (the average line length), we're processing 65,536 at a time. We're still reading and processing the same number of bytes, but we're now doing most of it in C rather than in the Python loop. Many of the optimized solutions use this basic approach -- in short, process things in bigger chunks.

The profiling output looks much better now. The `_count_elements` and `str.split` functions are still taking most of the time, but they're only being called 662 times instead 998170 (on roughly 64KB at a time rather than 42 bytes):


```
$ python3 -m cProfile -s tottime optimized.py <kjvbible_x10.txt
         7980 function calls (7968 primitive calls) in 1.280 seconds

   Ordered by: internal time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
      662    0.870    0.001    0.870    0.001 {built-in method _collections._count_elements}
      662    0.278    0.000    0.278    0.000 {method 'split' of 'str' objects}
        1    0.080    0.080    1.280    1.280 optimized.py:1(<module>)
      662    0.028    0.000    0.028    0.000 {method 'lower' of 'str' objects}
      663    0.010    0.000    0.016    0.000 {method 'read' of '_io.TextIOWrapper' objects}
        1    0.007    0.007    0.007    0.007 {built-in method builtins.sorted}
      664    0.004    0.000    0.004    0.000 {built-in method _codecs.utf_8_decode}
      663    0.001    0.000    0.872    0.001 __init__.py:608(update)
      664    0.001    0.000    0.005    0.000 codecs.py:319(decode)
      662    0.001    0.000    0.001    0.000 {built-in method builtins.isinstance}
      662    0.000    0.000    0.001    0.000 {built-in method _abc._abc_instancecheck}
      662    0.000    0.000    0.000    0.000 {method 'rfind' of 'str' objects}
      664    0.000    0.000    0.000    0.000 codecs.py:331(getstate)
      662    0.000    0.000    0.001    0.000 abc.py:96(__instancecheck__)
      7/1    0.000    0.000    0.000    0.000 {built-in method _abc._abc_subclasscheck}
        1    0.000    0.000    0.007    0.007 __init__.py:559(most_common)
        1    0.000    0.000    0.000    0.000 __init__.py:540(__init__)
      7/1    0.000    0.000    0.000    0.000 abc.py:100(__subclasscheck__)
        1    0.000    0.000    1.280    1.280 {built-in method builtins.exec}
        7    0.000    0.000    0.000    0.000 _collections_abc.py:392(__subclasshook__)
        1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}
        1    0.000    0.000    0.000    0.000 {method 'items' of 'dict' objects}
```

I also found that with the Python solution, reading and processing `bytes` vs `str` doesn't make a noticeable difference (the `utf_8_decode` is relatively far down the list). In addition, any buffer size above about 2KB is not much slower than 64KB -- I've noticed many systems have a default buffer size of 4KB, which seems very reasonable.

I tried various other ways to improve performance, but this was about the best I could manage with standard Python. Trying to optimize at the byte level just makes no sense in Python (or leads to a 10-100x slowdown) -- any per-character processing has to be done in C. Let me know if you find a better approach.

On my machine, the simple version runs in TODO seconds, the optimized version in TODO seconds.


## Go

A simple, idiomatic Go version would probably use `bufio.Scanner` with `ScanWords` as the split function. Go doesn't have anything like Python's `collection.Counter`, so you need to use a `map[string]int` for counting, and a slice of word-count pairs for the sort operation:

```go
func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Split(bufio.ScanWords)
    counts := make(map[string]int)
    for scanner.Scan() {
        word := strings.ToLower(scanner.Text())
        counts[word]++
    }
    if err := scanner.Err(); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }

    var ordered []Count
    for word, count := range counts {
        ordered = append(ordered, Count{word, count})
    }
    sort.Slice(ordered, func(i, j int) bool {
        return ordered[i].Count > ordered[j].Count
    })

    for _, count := range ordered {
        fmt.Println(string(count.Word), count.Count)
    }
}

type Count struct {
    Word  string
    Count int
}
```

The simple Go version is significantly faster than the simple Python version, but only a little bit faster than the optimized Python version (and almost double the number of lines of code -- there's definitely more boilerplate and low-level concerns).

To use Go's profiler, you have to add a few lines of code to the start of your program:

```go
f, err := os.Create("cpuprofile")
if err != nil {
    fmt.Fprintf(os.Stderr, "could not create CPU profile: %v\n", err)
    os.Exit(1)
}
if err := pprof.StartCPUProfile(f); err != nil {
    fmt.Fprintf(os.Stderr, "could not start CPU profile: %v\n", err)
    os.Exit(1)
}
defer pprof.StopCPUProfile()
```

Once you've run the program, you can view the CPU profile using this command:

```
$ go tool pprof -http=:7777 cpuprofile 
Serving web UI on http://localhost:7777
```

<a href="/images/count-words-go-simple.png" target="_blank">
![Go simple - profiling results](/images/count-words-go-simple.png)
</a>

The results are interesting, though not unexpected -- the operations in the per-word hot loop take all the time. A good chunk of the time is spent in the scanner, and another chunk is spent allocating strings to insert into the map, so let's try to optimize both of those parts

To improve scanning, we'll essentially make a cut-down version of `bufio.Scanner` and `ScanWords` (and do an ACIII to-lower operation in place). To reduce the allocations, we'll use a `map[string]*int` instead of `map[string]int` so we only have to allocate once per unique word, instead of for every increment (Martin Möhrmann gave me this tip on the Gophers Slack #performance channel).

Note that it took me a few iterations and profiling passes to get to this result. One in-between step was to still use `bufio.Scanner` but with a custom split function, `scanWordsASCII`. But it's a bit faster, and not much harder, to avoid `bufio.Scanner` altogether. Another thing I tried was a [custom hash table](https://github.com/benhoyt/counter), but I decided that was out of scope for this article, and it's not much faster than the `map[string]*int` in any case.

Here is the optimized code:

```go
func main() {
    offset := 0
    buf := make([]byte, 64*1024)
    counts := make(map[string]*int)
    for {
        // Read input in 64KB blocks till EOF.
        n, err := os.Stdin.Read(buf[offset:])
        if err != nil && err != io.EOF {
            fmt.Fprintln(os.Stderr, err)
            os.Exit(1)
        }
        if n == 0 {
            break
        }
        // Offset remaining from last time plus number of bytes read.
        chunk := buf[:offset+n]

        // Find last end-of-line character in block read.
        lastLF := bytes.LastIndexByte(chunk, '\n')
        toProcess := chunk
        if lastLF != -1 {
            toProcess = chunk[:lastLF]
        }

        // Loop through toProcess slice and count words.
        start := -1 // start -1 means in whitespace run
        for i, c := range toProcess {
            // Convert to ASCII lowercase in place as we go.
            if c >= 'A' && c <= 'Z' {
                c = c + ('a' - 'A')
                toProcess[i] = c
            }
            if start >= 0 {
                // In a word, look for end of word (whitespace).
                if c == ' ' || c == '\n' {
                    // Count this word!
                    increment(counts, toProcess[start:i])
                    start = -1
                }
            } else {
                // In whitespace, look for start of word (non-space).
                if c != ' ' && c != '\n' {
                    start = i
                }
            }
        }
        // Count last word, if any.
        if start >= 0 && start < len(toProcess) {
            increment(counts, toProcess[start:])
        }

        // Copy remaining bytes (incomplete line) to start of buffer.
        if lastLF != -1 {
            remaining := chunk[lastLF+1:]
            copy(buf, remaining)
            offset = len(remaining)
        } else {
            offset = 0
        }
    }

    var ordered []Count
    for word, count := range counts {
        ordered = append(ordered, Count{word, *count})
    }
    sort.Slice(ordered, func(i, j int) bool {
        return ordered[i].Count > ordered[j].Count
    })

    for _, count := range ordered {
        fmt.Println(string(count.Word), count.Count)
    }
}

func increment(counts map[string]*int, word []byte) {
    if p, ok := counts[string(word)]; ok {
        // Word already in map, increment existing int via pointer.
        *p++
        return
    }
    // Word not in map, insert new int.
    n := 1
    counts[string(word)] = &n
}
```

The profiling results are now very flat -- almost everything's in the main loop or the map access:

<a href="/images/count-words-go-optimized.png" target="_blank">
![Go simple - profiling results](/images/count-words-go-optimized.png)
</a>

It was a fun exercise, and Go gives you a fair bit of low-level control (and you could go quite a lot further -- memory mapped I/O, a custom hash table, etc). However, programmer time is valuable, and the optimized version above is not something I'd want to test or maintain. It's tricky code, and there is lots of potential for off-by-one errors (I'd be surprised if there isn't some bug already). In practice I'd probably stick with a `bufio.Scanner` with `ScanWords`, `bytes.ToLower`, and the `map[string]*int` trick.


## C++

* TODO: try literal file to solve cin slowness?


## AWK

AWK is actually a great tool for this job: reading lines and parsing into space-separated words are what it eats for breakfast. One thing AWK can't do (without resorting to Gawk-specific features) is the sorting, so I'm using the AWK pipe operator to send the output through `sort`. Here's the beautifully simple code:

```awk
{
    for (i = 1; i <= NF; i++)
        counts[tolower($i)]++
}

END {
    for (k in counts)
        print k, counts[k] | "sort -nr -k2"
}
```

I don't know of an easy way to profile this at a low level (Gawk does have a [profiling mode](https://www.gnu.org/software/gawk/manual/html_node/Profiling.html), but it just shows how many times each line was executed). I also don't know how to read the file in chunks in AWK or Gawk.

One small tweak I made for the optimized version was to call `tolower` once per line instead of for every word. The main loop becomes:

```awk
{
    $0 = tolower($0)
    for (i = 1; i <= NF; i++)
        counts[$i]++
}
```

We can run this using `gawk -b`, which puts Gawk into "bytes" mode so it uses ASCII instead of UTF-8. This "optimized" version using `gawk -b` is about 1.6x as fast as the simple version using straight `gawk`.

Another "optimization" is to run it using `mawk`, a faster AWK interpreter than `gawk`. In this case it's about 1.7 times as fast as `gawk -b`.

If you're interested in learning more about AWK, I've written an article about [GoAWK](https://benhoyt.com/writings/goawk/), my AWK interpreter written in Go (it's normally about as fast as Gawk), and also an article for LWN called [The State of the AWK](https://lwn.net/Articles/820829/), which surveys the "AWK landscape" and digs into the new features in Gawk 5.1.


## C?

## Rust?

## Ruby?


## Unix command line

TODO: mention Knuth and McIlroy thing up front -- very similar! https://franklinchen.com/blog/2011/12/08/revisiting-knuth-and-mcilroys-word-count-programs/

Just for fun, let's try a version with only basic Unix command line tools (this is essentially Doug McIlroy's solution):

```bash
tr 'A-Z' 'a-z' | tr -s ' ' '\n' | sort | uniq -c | sort -nr
```

At TODO seconds, it's quite slow, because it has to sort the entire file at once rather than using a hash table for counting (which goes against the constraints I've imposed). So this is fine for relatively small files, but I'd probably reach for AWK or Python instead.

The output is not quite the same as the others, because the format is "space-prefixed-count word" rather than "word count", like so:

```
      4 the
      2 foo
      1 defenestration
```

We could fix that with something like `awk '{ print $2, $1 }'`, but then we're using AWK anyway, and we might as well use the more efficient AWK program above.


## Performance numbers

TODO


## What can we learn?

* I think it's the "simple" versions that are most telling. It's what a normal programmer would write the first time.

* interestingly, I/O isn't the bottleneck here. Old assumptions die hard.

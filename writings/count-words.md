---
layout: default
title: "Performance comparison: counting words in Python, Go, C++, C, AWK, and Forth"
permalink: /writings/count-words/
description: "Performance comparison of counting and sorting word frequencies in various languages (Python, Go, C++, C, AWK, and Forth)"
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2021</p>

<!--
TODO:
- pin GitHub.com file versions in case of updates?
- spell check, proof, shorten
- when publishing, add link to https://codereview.stackexchange.com/questions/256910/count-word-frequencies-and-print-them-most-frequent-first
- also comp.lang.forth thread: https://groups.google.com/u/1/g/comp.lang.forth/c/8ugTFxGXdaI
-->


> Summary: I describe a simple interview problem (counting frequencies of unique words), solve it in various languages, and compare performance across them. For each language, I've included a simple, idiomatic solution as well as a more optimized approach via profiling.
>
> **Go to:** [Problem](#problem-statement-and-constraints) \| [Python](#python) \| [Go](#go) \| [C++](#c) \| [C](#c-1) \| [AWK](#awk) \| [Forth](#forth) \| [Others](#c-java-javascript-ruby-rust) \| [Unix](#unix-shell) \| [**Results!**](#performance-results-and-learnings)


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

The reason I think this is a good interview question is that it's somewhat harder to solve than [FizzBuzz](https://blog.codinghorror.com/why-cant-programmers-program/), yet it doesn't suffer from the "invert a binary tree on this whiteboard" issue. It's the kind of thing a programmer might have to write a script for in real life, and it shows whether they understand file I/O, hash tables (maps), and how to use their language's `sort` function. There's a little bit of trickiness in the sorting part, because most hash data structures aren't ordered, and if they are, it's by key or insertion order and not by value.

After the candidate has a basic solution, you can push it in all sorts of different directions: what about capitalization? punctuation? how does it order two words with the same frequency? what's the performance bottleneck likely to be? how does it fare in terms of big-O? what's the memory usage? roughly how long would your program take to process a 1GB file? would your solution still work for 1TB? and so on. Or you can take it in a "software engineering" direction and talk about error handling, testability, turning it into a hardened command line utility, etc.

A basic solution reads the file line-by-line, converts to lowercase, splits each line into words, and counts the frequencies in a hash table. When it's done that, it converts the hash table to a list of key-value pairs, sorts by value (largest first), and finally prints them out.

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

If the candidate was a Pythonista, they might use `collections.defaultdict` or even `collections.Counter` -- see below for code using the latter. In that case I'd ask them how it worked under the hood, or how they might do it with a plain dictionary. I'm including large snippets of code in the article, but full source for each version is in my [benhoyt/countwords](https://github.com/benhoyt/countwords) repository. Or you can cheat and jump straight to the [performance numbers](#performance-results-and-learnings).

Incidentally, this problem [set the scene](http://www.leancrew.com/all-this/2011/12/more-shell-less-egg/) for a great computer science wizard duel several decades ago. In 1986, Jon Bentley asked Donald Knuth to show off "literate programming" with a solution to this problem, and he came up with an exquisite, ten-page Knuth masterpiece. Then Doug McIlroy (the inventor of Unix pipelines) replied with a one-liner [Unix shell version](#unix-shell) using `tr`, `sort`, and `uniq`.

![Knuth vs McIlroy](/images/count-words-knuth-vs-mcilroy.png)

*Image credit [comic.browserling.com/97](https://comic.browserling.com/97).*

In any case, I've been playing with this problem for a while now, and I wanted to see what the performance would be like in various languages, both with a simple idiomatic solution and with a more optimized version.


## Problem statement and constraints

Each program must read from standard input or from a file, and print the frequencies of unique, space-separated words in the file, in order from most frequent to least frequent. To keep our solutions simple and consistent, here are the (self-imposed) constraints I'm working against:

* Normalize: the program must normalize words to lowercase, so "The the" should appear as "the 2" in the output.
* Words: anything separated by whitespace -- ignore punctuation. This does make the program less useful, but I don't want to this to become a tokenization battle.
* ASCII: it's okay to only support ASCII for the whitespace handling and lowercase operation. Most of the optimized variants do this.
* Ordering: if the frequency of two words is the same, their order in the output doesn't matter.
* Threading: it should run in a single thread on a single machine (though I discuss concurrency in my interviews).
* Memory: don't read whole file into memory. Buffering it line-by-line is okay, or in chunks with a maximum buffer size of 64KB. That said, it's okay to keep the whole word-count map in memory (we're assuming the input is text in a real language, not full of randomized unique words).
* Text: assume that the input file is text, with "reasonable" length lines shorter than the buffer size.
* Safe: even for the optimized variants, try not to use unsafe language features, and don't drop down to assembly.
* Hashing: don't roll our own hash table (with the exception of the optimized C version).
* Stdlib: only use the language's standard library functions.

Our input file will be the text of the King James version of the Bible, copied ten times. I sourced this [from Gutenberg.org](https://www.gutenberg.org/ebooks/10), replaced smart quotes with the ASCII quote character, and used `cat` to multiply it by ten to get the 43MB reference input file.

So let's get coding! The solutions below are in the order I solved them.


## Python

An idiomatic Python version would probably use `collections.Counter` (Python's collections library is really nice -- thanks Raymond Hettinger!). It's about as simple as you can get:

[**simple.py**](https://github.com/benhoyt/countwords/blob/master/simple.py)

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

[**optimized.py**](https://github.com/benhoyt/countwords/blob/master/optimized.py)

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


## Go

A simple, idiomatic Go version would probably use `bufio.Scanner` with `ScanWords` as the split function. Go doesn't have anything like Python's `collection.Counter`, so you need to use a `map[string]int` for counting, and a slice of word-count pairs for the sort operation:

[**simple.go**](https://github.com/benhoyt/countwords/blob/master/simple.go)

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

Once you've run the program, you can view the CPU profile using this command (click to view the image full size):

```
$ go tool pprof -http=:7777 cpuprofile 
Serving web UI on http://localhost:7777
```

<a href="/images/count-words-go-simple.png" target="_blank">
![Go simple - profiling results](/images/count-words-go-simple-1400.png)
</a>

The results are interesting, though not unexpected -- the operations in the per-word hot loop take all the time. A good chunk of the time is spent in the scanner, and another chunk is spent allocating strings to insert into the map, so let's try to optimize both of those parts

To improve scanning, we'll essentially make a cut-down version of `bufio.Scanner` and `ScanWords` (and do an ACIII to-lower operation in place). To reduce the allocations, we'll use a `map[string]*int` instead of `map[string]int` so we only have to allocate once per unique word, instead of for every increment (Martin Möhrmann gave me this tip on the Gophers Slack #performance channel).

Note that it took me a few iterations and profiling passes to get to this result. One in-between step was to still use `bufio.Scanner` but with a custom split function, `scanWordsASCII`. But it's a bit faster, and not much harder, to avoid `bufio.Scanner` altogether. Another thing I tried was a [custom hash table](https://github.com/benhoyt/counter), but I decided that was out of scope for the Go version, and it's not much faster than the `map[string]*int` in any case.

[**optimized.go**](https://github.com/benhoyt/countwords/blob/master/optimized.go)

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
![Go simple - profiling results](/images/count-words-go-optimized-1400.png)
</a>

It was a fun exercise, and Go gives you a fair bit of low-level control (and you could go quite a lot further -- memory mapped I/O, a custom hash table, etc). However, programmer time is valuable, and the optimized version above is not something I'd want to test or maintain. It's tricky code, and there is lots of potential for off-by-one errors (I'd be surprised if there isn't some bug already). In practice I'd probably stick with a `bufio.Scanner` with `ScanWords`, `bytes.ToLower`, and the `map[string]*int` trick.


## C++

C++ has come a long way since I last used it seriously: lots of goodies in C++11, and then more in C++14, 17, and 20. Features, features everywhere! It's definitely a lot terser than old-school C++, though the error messages are still a mess. Here's the simple version I came up with (with some [help from Code Review Stack Exchange](https://codereview.stackexchange.com/a/256916/100945) to make it a bit more idiomatic):

[**simple.cpp**](https://github.com/benhoyt/countwords/blob/master/simple.cpp)

```cpp
int main() {
    std::string word;
    std::unordered_map<std::string, int> counts;
    while (std::cin >> word) {
        std::transform(word.begin(), word.end(), word.begin(),
            [](unsigned char c){ return std::tolower(c); });
        ++counts[word];
    }
    if (std::cin.bad()) {
        std::cerr << "error reading stdin\n";
        return 1;
    }

    std::vector<std::pair<std::string, int>> ordered(counts.begin(),
        counts.end());
    std::sort(ordered.begin(), ordered.end(),
        [](auto const& a, auto const& b) { return a.second>b.second; });

    for (auto const& count : ordered) {
        std::cout << count.first << " " << count.second << "\n";
    }
}
```

When optimizing this, the first thing to do is compile with optimizations enabled (`g++ -O2`). I kind of like the fact that with Go you don't have to worry about this -- optimizations are always on.

I noticed that that I/O was comparatively slow. It turns out there is a magic incantation you can recite at the start of your program to disable synchronizing with the C stdio functions after each I/O operation. This line makes it run almost twice as fast:

[**optimized.cpp**](https://github.com/benhoyt/countwords/blob/master/optimized.cpp)

```cpp
ios::sync_with_stdio(false);
```

GCC can generate a profiling report for use with `gprof`. Here's what a few lines of it looks like -- I kid you not:

```
index % time    self  children    called     name
                                  13             frame_dummy [1]
[1]    100.0    0.01    0.00       0+13      frame_dummy [1]
                                  13             frame_dummy [1]
-----------------------------------------------
                0.00    0.00   32187/32187       std::vector<std::pair\
<std::__cxx11::basic_string<char, std::char_traits<char>, std::allocat\
or<char> >, int>, std::allocator<std::pair<std::__cxx11::basic_string<\
char, std::char_traits<char>, std::allocator<char> >, int> > >::vector\
<std::__detail::_Node_iterator<std::pair<std::__cxx11::basic_string<ch\
ar, std::char_traits<char>, std::allocator<char> > const, int>, false,\
 true>, void>(std::__detail::_Node_iterator<std::pair<std::__cxx11::ba\
sic_string<char, std::char_traits<char>, std::allocator<char> > const,\
 int>, false, true>, std::__detail::_Node_iterator<std::pair<std::__cx\
x11::basic_string<char, std::char_traits<char>, std::allocator<char> >\
 const, int>, false, true>, std::allocator<std::pair<std::__cxx11::bas\
ic_string<char, std::char_traits<char>, std::allocator<char> >, int> >\
 const&) [11]
[8]      0.0    0.00    0.00   32187         void std::__cxx11::basic_\
string<char, std::char_traits<char>, std::allocator<char> >::_M_constr\
uct<char*>(char*, char*, std::forward_iterator_tag) [8]
-----------------------------------------------
                0.00    0.00       1/1           __libc_csu_init [17]
[9]      0.0    0.00    0.00       1         _GLOBAL__sub_I_main [9]
...
```

Ah, C++ templates. Call me old-school, but I do prefer the names `malloc` and `scanf` over `std::basic_istream<char, std::char_traits<char> >& std::operator>><char, std::char_traits<char>, std::allocator<char> >(std::basic_istream<char, std::char_traits<char> >&, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >&)`.

I really didn't feel like deciphering this output, so I kind of gave up. There's obviously a lot more pushing you could do with C++. However, I suspect it would end up getting more and more low-level and more C-like (at least with my limited knowledge of modern C++), so if you want to see more of that, go to the C variants below. I also used the Valgrind profiler (Callgrind) in the C version.


## C

C is a beautiful beast that will never die: fast, unsafe, and simple (for some value of "simple"). I still like it, because (unlike C++) I can understand it, and I can go as low-level as I want. It's also ubiquitous (the Linux kernel, Redis, PostgreSQL, SQLite, many many libraries ... the list is endless), and it's not going away anytime soon. So let's try a C version.

Unfortunately, C doesn't have a hash table data structure in its standard library. However, there is libc, which has the [`hcreate` and `hsearch`](https://linux.die.net/man/3/hsearch) hash table functions, so we'll make a small exception and use those libc-but-not-stdlib functions. (In the optimized version we'll roll our own hash table.)

One minor annoyance with `hcreate` is you have to specify the maximum table size up-front. I know the number of unique words is about 30,000, so we'll make it 60,000 for now.

[**simple.c**](https://github.com/benhoyt/countwords/blob/master/simple.c)

```c
#define MAX_UNIQUES 60000

typedef struct {
    char* word;
    int count;
} count;

// Comparison function for qsort() ordering by count descending.
int cmp_count(const void* p1, const void* p2) {
    int c1 = ((count*)p1)->count;
    int c2 = ((count*)p2)->count;
    if (c1 == c2) return 0;
    if (c1 < c2) return 1;
    return -1;
}

int main() {
    // The hcreate hash table doesn't provide a way to iterate, so
    // store the words in an array too (also used for sorting).
    count* words = calloc(MAX_UNIQUES, sizeof(count));
    int num_words = 0;

    // Allocate hash table.
    if (hcreate(MAX_UNIQUES) == 0) {
        fprintf(stderr, "error creating hash table\n");
        return 1;
    }

    char word[101]; // 100-char word plus NUL byte
    while (scanf("%100s", word) != EOF) {
        // Convert word to lower case in place.
        for (char* p = word; *p; p++) {
            *p = tolower(*p);
        }

        // Search for word in hash table.
        ENTRY item = {word, NULL};
        ENTRY* found = hsearch(item, FIND);
        if (found != NULL) {
            // Word already in table, increment count.
            int* pn = (int*)found->data;
            (*pn)++;
        } else {
            // Word not in table, insert it with count 1.
            item.key = strdup(word); // need to copy word
            if (item.key == NULL) {
                fprintf(stderr, "out of memory in strdup\n");
                return 1;
            }
            int* pn = malloc(sizeof(int));
            if (pn == NULL) {
                fprintf(stderr, "out of memory in malloc\n");
                return 1;
            }
            *pn = 1;
            item.data = pn;
            ENTRY* entered = hsearch(item, ENTER);
            if (entered == NULL) {
                fprintf(stderr, "table full, increase MAX_UNIQUES\n");
                return 1;
            }

            // And add to words list for iterating.
            words[num_words].word = item.key;
            num_words++;
        }
    }

    // Iterate once to add counts to words list, then sort.
    for (int i = 0; i < num_words; i++) {
        ENTRY item = {words[i].word, NULL};
        ENTRY* found = hsearch(item, FIND);
        if (found == NULL) { // shouldn't happen
            fprintf(stderr, "key not found: %s\n", item.key);
            return 1;
        }
        words[i].count = *(int*)found->data;
    }
    qsort(&words[0], num_words, sizeof(count), cmp_count); 

    // Iterate again to print output.
    for (int i = 0; i < num_words; i++) {
        printf("%s %d\n", words[i].word, words[i].count);
    }

    return 0;
}
```

There's a fair bit of boilerplate (mostly for memory allocation and error checking), but as far as C goes, I don't think it's too bad. The tricky stuff is mostly hidden -- tokenization behind `scanf`, and hash table operations behind `hsearch`. It's also relatively fast out of the box, and very small (a 17KB executable on Linux).

To profile, I tried using `gprof`, but it didn't show anything useful (maybe it's not sampling often enough?), so I investigated using the [Valgrind](https://www.valgrind.org/) profiler, [Callgrind](https://www.valgrind.org/docs/manual/cl-manual.html). This was the first time I've used it, but it seems like an amazing and powerful tool.

After building with `gcc -g`, I ran this command to generate the profile:

```
valgrind --tool=callgrind ./simple-c <kjvbible_x10.txt >/dev/null
```

<a href="/images/count-words-c-simple.png" target="_blank">
![C simple - profiling results](/images/count-words-c-simple-1400.png)
</a>

Not surprisingly, it shows that `scanf` is the major culprit, followed by `hsearch`. So here's where we'll go a bit crazy with optimization. I want to focus on three things:

* Read the file in chunks, like we did in Go and Python. This will avoid the overhead of `scanf`.
* Process the bytes only once, or at least as few times as possible -- I'll be converting to lowercase and calculating the hash as we're tokenizing into words.
* Implement our own hash table using the fast [FNV-1 hash function](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function).

[**optimized.c**](https://github.com/benhoyt/countwords/blob/master/optimized.c)

```c
#define BUF_SIZE 65536
#define HASH_LEN 65536  // must be a power of 2
#define FNV_OFFSET 14695981039346656037UL
#define FNV_PRIME 1099511628211UL

// Used both for hash table buckets and array for sorting.
typedef struct {
    char* word;
    int word_len;
    int count;
} count;

// Comparison function for qsort() ordering by count descending.
int cmp_count(const void* p1, const void* p2) {
    int c1 = ((count*)p1)->count;
    int c2 = ((count*)p2)->count;
    if (c1 == c2) return 0;
    if (c1 < c2) return 1;
    return -1;
}

count* table;
int num_unique = 0;

// Increment count of word in hash table (or insert new word).
void increment(char* word, int word_len, uint64_t hash) {
    // Make 64-bit hash in range for items slice.
    int index = (int)(hash & (uint64_t)(HASH_LEN-1));

    // Look up key, using direct match and linear probing if not found.
    while (1) {
        if (table[index].word == NULL) {
            // Found empty slot, add new item (copying key).
            char* word_copy = malloc(word_len);
            if (word_copy == NULL) {
                fprintf(stderr, "out of memory\n");
                exit(1);
            }
            memmove(word_copy, word, word_len);
            table[index].word = word_copy;
            table[index].word_len = word_len;
            table[index].count = 1;
            num_unique++;
            return;
        }
        if (table[index].word_len == word_len &&
                memcmp(table[index].word, word, word_len) == 0) {
            // Found matching slot, increment existing count.
            table[index].count++;
            return;
        }
        // Slot already holds another key, try next slot (linear probe).
        index++;
        if (index >= HASH_LEN) {
            index = 0;
        }
    }
}

int main() {
    // Allocate hash table buckets.
    table = calloc(HASH_LEN, sizeof(count));
    if (table == NULL) {
        fprintf(stderr, "out of memory\n");
        return 1;
    }

    char buf[BUF_SIZE];
    int offset = 0;
    while (1) {
        // Read file in chunks, processing one chunk at a time.
        size_t num_read = fread(buf+offset, 1, BUF_SIZE-offset, stdin);
        if (num_read == 0) {
            break;
        }

        // Find last space or linefeed in buf and process up to there.
        int space;
        for (space = offset+num_read-1; space>=0; space--) {
            char c = buf[space];
            if (c == ' ' || c == '\n') {
                break;
            }
        }
        int num_process = (space >= 0) ? space : (int)num_read+offset;

        // Scan chars to process: tokenize, lowercase, and hash as we go.
        int i = 0;
        while (1) {
            // Skip whitespace before word.
            for (; i < num_process; i++) {
                char c = buf[i];
                if (c != ' ' && c != '\n') {
                    break;
                }
            }
            // Look for end of word, lowercase and hash as we go.
            uint64_t hash = FNV_OFFSET;
            int start = i;
            for (; i < num_process; i++) {
                char c = buf[i];
                if (c == ' ' || c == '\n') {
                    break;
                }
                if (c >= 'A' && c <= 'Z') {
                    c += ('a' - 'A');
                    buf[i] = c;
                }
                hash *= FNV_PRIME;
                hash ^= (uint64_t)c;
            }
            if (i <= start) {
                break;
            }
            // Got a word, increment count in hash table.
            increment(buf+start, i-start, hash);
        }

        // Move down remaining partial word.
        if (space >= 0) {
            offset = (offset+num_read-1) - space;
            memmove(buf, buf+space+1, offset);
        } else {
            offset = 0;
        }
    }

    count* ordered = calloc(num_unique, sizeof(count));
    for (int i=0, i_unique=0; i<HASH_LEN; i++) {
        if (table[i].word != NULL) {
            ordered[i_unique++] = table[i];
        }
    }
    qsort(ordered, num_unique, sizeof(count), cmp_count);
    for (int i=0; i<num_unique; i++) {
        printf("%s %d\n", ordered[i].word, ordered[i].count);
    }

    return 0;
}
```

At around 150 lines (including blanks and comments), it's definitely the biggest program yet, but not too bad! As you can see, rolling your own hash table with linear probing is not a lot of code. It's not great to have a fixed size table (like `hcreate`), but adding dynamic resizing is just busy-work, and doesn't slow down the running time significantly, so I've left that as an exercise for the reader.

It's still only a 17KB executable (that's what I love about C). And, unsurprisingly, this is the fastest version -- a little bit faster than the optimized Go version, because we've rolled our own custom hash table, and we're processing fewer bytes.

One thing I'm a little bit proud of is that it's about 15% faster than `wc` on the same input, and `wc` just has to tokenize words, not count unique words, so it doesn't need a hash table. This program is not as fast as the incredible GNU `grep`, of course -- somewhat unintuitively, [`grep` doesn't have to process every byte](https://lists.freebsd.org/pipermail/freebsd-current/2010-August/019310.html).

I'm sure there's much further you could go with this: investigate memory-mapped I/O, avoid processing byte-at-a-time, use a fancier data structure for counting, etc. But this is quite enough for now!


## AWK

AWK is actually a great tool for this job: reading lines and parsing into space-separated words are what it eats for breakfast. One thing AWK can't do (without resorting to Gawk-specific features) is the sorting, so I'm using the AWK pipe operator to send the output through `sort`. Here's the beautifully simple code:

[**simple.awk**](https://github.com/benhoyt/countwords/blob/master/simple.awk)

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

[**optimized.awk**](https://github.com/benhoyt/countwords/blob/master/optimized.awk)

```awk
{
    $0 = tolower($0)
    for (i = 1; i <= NF; i++)
        counts[$i]++
}
```

We can run this using `gawk -b`, which puts Gawk into "bytes" mode so it uses ASCII instead of UTF-8. This "optimized" version using `gawk -b` is about 1.6x as fast as the simple version using straight `gawk`.

Another "optimization" is to run it using `mawk`, a faster AWK interpreter than `gawk`. In this case it's about 1.7 times as fast as `gawk -b`.

Interestingly, the Gawk manual has a [page](https://www.gnu.org/software/gawk/manual/html_node/Word-Sorting.html) on this problem, with an example of how to strip out punctuation using AWK's `gsub` function.

If you're interested in learning more about AWK, I've written an article about [GoAWK](https://benhoyt.com/writings/goawk/), my AWK interpreter written in Go (it's normally about as fast as Gawk), and also an article for LWN called [The State of the AWK](https://lwn.net/Articles/820829/), which surveys the "AWK landscape" and digs into the new features in Gawk 5.1.


## Forth

[Forth](https://en.wikipedia.org/wiki/Forth_(programming_language)) was the first programming language I learned (it's an amazing language), so I decided to try a Forth version using [Gforth](https://gforth.org/). I haven't written anything in the language for years, but here goes (though I'm not sure it's valid to call this *simple*!):

[**simple.fs**](https://github.com/benhoyt/countwords/blob/master/simple.fs)

```
200 constant max-line
create line max-line allot  \ Buffer for read-line
wordlist constant counts    \ Hash table of words to count
variable num-uniques  0 num-uniques !

\ Allocate space for new string and copy bytes, return new string.
: copy-string ( addr u -- addr' u )
    dup >r  dup allocate throw
    dup >r  swap move  r> r> ;

\ Convert character to lowercase.
: to-lower ( C -- c )
    dup [char] A [ char Z 1+ ] literal within if
        32 +
    then ;

\ Convert string to lowercase in place.
: lower-in-place ( addr u -- )
    over + swap ?do
        i c@ to-lower i c!
    loop ;

\ Count given word in hash table.
: count-word ( addr u -- )
    2dup counts search-wordlist if
        \ Increment existing word
        >body 1 swap +!
        2drop
    else
        \ Insert new (copied) word with count 1
        copy-string
        2dup lower-in-place
        ['] create execute-parsing 1 ,
        1 num-uniques +!
    then ;

\ Process text in the source buffer (one line).
: process-input ( -- )
    begin
        parse-name dup
    while
        count-word
    repeat
    2drop ;

\ Less-than for words (true if count is *greater* for reverse sort).
: count< ( nt1 nt2 -- )
    >r name>interpret >body @
    r> name>interpret >body @
    > ;

\ ... Definition of "sort" elided ...

\ Append word from wordlist to array at given offset.
: append-word ( addr offset nt -- addr offset+cell true )
    >r 2dup + r> swap !
    cell+ true ;

\ Show "word count" line for each word (unsorted).
: show-words ( -- )
    num-uniques @ cells allocate throw
    0 ['] append-word counts traverse-wordlist drop
    dup num-uniques @ sort
    num-uniques @ 0 ?do
        dup i cells + @
        dup name>string type space
        name>interpret >body @ . cr
    loop
    drop ;

: main ( -- )
    counts set-current  \ Define into counts wordlist
    begin
        line max-line stdin read-line throw
    while
        line swap ['] process-input execute-parsing
    repeat
    drop
    show-words ;
```

It's not for nothing that Forth has a reputation for being write-only. I used to love the idea of no local variables, but in practice it just means a lot of `dup over swap rot`. In addition, even Gforth (which has a lot more than ANS standard Forth) doesn't have fairly basic tools like `to-lower` or `sort`, so we have to roll those ourselves (the in-place merge sort was taken from Rosetta Code).

Thankfully hash tables are present via `wordlist`. This is really intended for definitions, but with Gforth's `execute-parsing` extension it works pretty well for hash tables. And `skip` and `scan` work well for the whitespace parsing (thanks [comp.lang.forth](https://groups.google.com/u/1/g/comp.lang.forth/c/8ugTFxGXdaI) folks for your help).

TODO: optimize and read in chunks? shouldn't be too hard
TODO: also, SKIP and SCAN vs PARSE-WORD

For optimizing, it turns out you can run `gforth-fast` instead of `gforth` to magically speed things up, so that's my first optimization. It looks like `gforth-fast` avoids call overhead but doesn't produce good stack traces on error.

TODO - remove. I'm not going to try to optimize the Forth version -- I'm far from proficient in Forth, now, and I don't really know where to start with profiling in Gforth (it [looks like](https://github.com/forthy42/gforth/blob/master/engine/profile.c) they have some kind of support for it).


## C#, Java, JavaScript, Ruby, Rust?

I'd love readers to send pull requests to the [`benhoyt/countwords`](https://github.com/benhoyt/countwords) repository to add other popular languages, and I'll link them here. I'm not familiar enough with them to do them justice anyway.


## Unix shell

Let's try a version with only basic Unix command line tools -- this is essentially [Doug McIlroy's solution](http://www.leancrew.com/all-this/2011/12/more-shell-less-egg/):

```bash
tr 'A-Z' 'a-z' | tr -s ' ' '\n' | sort | uniq -c | sort -nr
```

It's quite slow (algorithmically and in practice), because it has to sort the entire file at once rather than using a hash table for counting (which actually goes against the constraints I've imposed). So this is fine for relatively small files, but if I wanted a one-liner I'd probably reach for AWK instead.

The output is not quite the same as the others, because the format is "space-prefixed-count word" rather than "word count", like so:

```
      4 the
      2 foo
      1 defenestration
```

We could fix that with something like `awk '{ print $2, $1 }'`, but then we're using AWK anyway, and we might as well use the more efficient [AWK program](#awk) above.


## Performance results and learnings

Below are the performance numbers of running these programs on my laptop (64-bit Linux with an SSD). The times are in seconds, so lower is better. I'm running each test five times and taking the minimum time as the final result.

TODO: update

Language | Simple | Optimized
-------- | ------ | ---------
C        |   1.20 |      0.34
Go       |   1.46 |      0.43
C++      |   2.17 |      1.22*
Python   |   2.32 |      1.37
AWK      |   4.09 |      1.42*
Forth    |   4.37 |          
Shell    |  16.85 |          

Notes (\*): the optimized C++ version isn't really very optimized -- look at the C version instead. Also, the optimized AWK version is run using `mawk`.

What can we learn from all this? Here are a few thoughts:

* I think it's the simple, idiomatic versions that are the most telling. This is the code programmers are likely to write in real life.
* You almost certainly shouldn't write the optimized C version, unless you're writing a new GNU `wordfreq` tool or something. It's just too easy to get wrong. If you want a fast version in a safe language, I'd recommend Go or Rust.
* If you just need a quick solution (which is likely), Python and AWK are amazing for this kind of text processing.
* C++ templates produce such horrible error messages and function names in the profiler, making them almost unreadable.
* I still think this interview question is a good one for a coding question, though obviously I wouldn't expect a candidate to write one of the optimized solutions on the whiteboard.
* We usually think of I/O as expensive, but I/O isn't the bottleneck here. In the case of benchmarks, the file is probably cached, but even if not, hard drive read speeds are incredibly fast these days. The tokenization and hash table operations are the bottleneck.

This was definitely a fun exercise! I learned a good amount about optimization hot-spots, using the Valgrind profiler, and I wrote some Forth code for the first time in years.

Let me know your thoughts or feedback, or send ideas for improvements. You're welcome to contribute to [benhoyt/countwords](github.com/benhoyt/countwords) -- I'd especially welcome pull requests to add C#, Java, JavaScript, Ruby, or Rust.

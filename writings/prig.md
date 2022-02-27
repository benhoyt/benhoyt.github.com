---
layout: default
title: "Prig: like AWK, but uses Go for \"scripting\""
permalink: /writings/prig/
description: "Describes Prig, which is for Processing Records In Go. It's a text processing tool like AWK, but it uses Go as the scripting language."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">February 2022</p>

> Summary: The article describes Prig, my AWK-like tool that uses Go as the scripting language. I compare Prig with AWK, then dive into how Prig works, and finally look briefly at Prig's `Sort` and `SortMap` builtins (which use Go's new generics if Go 1.18 is available).
>
> **Go to:** [Prig vs AWK](#prig-compared-to-awk) \| [Go output](#resulting-go-program) \| [Testing](#fun-with-testing) \| [Generics](#experimenting-with-generics) \| [Conclusion](#conclusion-was-it-worth-it)


In a recent Hacker News [comment](https://news.ycombinator.com/item?id=30191430) I learned about [`rp`](https://github.com/c-blake/cligen/blob/master/examples/rp.nim), a little text processing tool by Charles Blake that is kind of like AWK, but uses [Nim](https://nim-lang.org/) as the scripting language. The works because the Nim compiler is fast and the Nim language is terse, so you can use it for one-off scripts.

Go has one of those two things going for it: fast build times. It's not exactly terse, which makes it less than ideal for one-liner scripts. On the other hand, it's not terrible, either: Prig scripts are about twice as many characters as their AWK versions.

Charles suggested that languages with fast compile speeds, like Nim and Go, are ideal for this kind of tool. The code to do it is almost trivial: Prig is about 200 lines of straight-forward Go code that inserts the user's command-line "script" into a Go source code template, compiles that, and then runs the resulting executable.

On my Linux machine, `go build` can build a program that only uses the standard library in about 200 milliseconds, so the startup time is very reasonable -- Go can compile and run the program almost before you've released the Enter key. For comparison, Nim gives `rp` a startup time of about 1.4 seconds on my system (0.8 seconds if using the `tcc` backend).

So I decided to build an equivalent of `rp` in Go, and ended up with [Prig](https://github.com/benhoyt/prig), which is of course for **P**rocessing **R**ecords **I**n **G**o. You could say that Prig is like AWK, but snobbish -- it turns down its nose at dynamic typing.


## Prig compared to AWK

First, if you haven't used AWK before, here it is in one paragraph. AWK is a language interpreter for processing input line-by-line. First it runs an optional `BEGIN` block. Then it runs a `pattern { action }` block for each line of input: if the line matches the pattern, AWK runs the action. If you don't specify a pattern, every line matches; if you don't specify an action, the default action is to print the line. After processing input it runs an optional `END` block. We'll see some examples soon.

So what does Prig look like, and how does that compare to AWK? Let's look at a few example scripts. Say you have a log file containing HTTP request lines, like so:

```
$ cat logs.txt
GET /robots.txt HTTP/1.1
HEAD /README.md HTTP/1.1
GET /wp-admin/ HTTP/1.0
```

You want to pull out the second field (the relative URL) and for each request, print the full URL for your site. Here's how to do it with Prig:

```
$ prig 'Println("https://example.com" + S(2))' <logs.txt
https://example.com/robots.txt
https://example.com/README.md
https://example.com/wp-admin/
```

The `Println` function is just Go's `fmt.Println`, but using a buffered writer for efficiency. It's equivalent to AWK's `print` statement. The `S(i)` function returns field `i` as a string, so `S(2)` returns the second field, like `$2` in AWK. The rest of the semantics are just regular Go semantics.

In AWK, the same script would look like this:

```
$ awk '{ print "https://example.com" $2 }' <logs.txt
https://example.com/robots.txt
...
```

Just 3 characters shorter -- not bad so far.

Here's where things start to get worse for Go. Below is a script, shown in both Prig and AWK variants, that prints the average value of the last field, by summing the field and then dividing by the number of records at the end:

```
$ cat average.txt 
a b 400
c d 200
e f 200
g h 200

$ prig -b 's := 0.0' 's += F(NF())' -e 'Println(s / float64(NR()))' \
  <average.txt
250

$ awk '{ s += $NF } END { print s / NR }' <average.txt
250
```

The script is 60 characters for Prig, 35 for AWK -- almost twice the length. Go (and many statically-typed languages) are at a disadvantage here. First we have to initialize our sum variable to 0; in AWK that's implicit.

Then we have the extra parentheses in `F(NF())` compared to AWK's cleaner `$NF`. I made a design decision early on to make all Prig builtins *functions* -- initially I had `NF` and `NR` as variables, but making them all functions means the code can split into fields lazily, only as needed (some simple scripts don't).

Then there's the `float64()` conversion, which along with the parentheses for `NR()` and `Println()`, mean Prig ends up looking a bit like Lisp in some cases. AWK's `print s / NR` is definitely easier on the eye!

Our third example prints the third field of each line multiplied by 1000 (that is, in milliseconds) if the input line contains either of the strings `GET` or `HEAD`. Here's that Prig script compared to its AWK equivalent:

```
$ cat millis.txt 
1 GET 3.14159
2 HEAD 4.0
3 GET 1.0

$ prig 'if Match(`GET|HEAD`, S(0)) { Printf("%.0fms\n", F(3)*1000) }' \
  <millis.txt
3142ms
4000ms
1000ms

$ awk '/GET|HEAD/ { printf "%.0fms\n", $3*1000 }' <millis.txt
3142ms
4000ms
1000ms
```

That's 62 characters in Prig, 43 in AWK -- not bad. The main difference here is the AWK `/regex/` shortcut. I thought about adding a special case for this in Prig, but I decided on simple, consistent Go over shortcuts -- so in Prig you have to write the `if` and `Match` explicitly.

Now a longer example. This is a script that counts the frequencies of unique words in the input and then prints the words and their counts, most frequent first.

```
$ cat words.txt 
The foo barfs
foo the the the

$ prig -b 'freqs := map[string]int{}' \
       'for i := 1; i <= NF(); i++ { freqs[strings.ToLower(S(i))]++ }' \
       -e 'for _, f := range SortMap(freqs, ByValue, Reverse) { ' \
       -e 'Println(f.K, f.V) }' \
       <words.txt 
the 4
foo 2
barfs 1

$ awk '{ for (i = 1; i <= NF; i++) freqs[tolower($i)]++ }
      END { for (k in freqs) print k, freqs[k] | "sort -nr -k2,1" }' \
      <words.txt
```

That's quite a mouthful, particularly in Prig. First we initialize a map of frequencies, keyed by word (again, that's implicit in AWK). The per-record code is very similar, albeit a bit more verbose in Go with the `strings` package prefix.

The sorting is done quite differently between the two: in Prig, I've defined two sorting functions, `Sort`, which takes a slice of ints, floats, or strings and returns a new sorted slice, and `SortMap`, which returns a sorted slice of key-value pairs in the map (optionally sorted by value, and optionally sorted in reverse order).

POSIX AWK doesn't have built-in sorting (only Gawk does), so we use AWK's pipe redirect syntax to send it through the `sort` utility. We could have used the same technique with Prig using a shell pipeline, but this shows how to use the `SortMap` function.

For most examples, AWK is definitely clearer and less verbose -- there was a reason Aho, Weinberger, and Kernighan designed a new language for AWK instead of using C (or similar) as the base language.

On the other hand, if you know Go well and don't know AWK, Prig might be useful for you. It's also significantly faster, because Go compiles to optimized machine code, whereas AWK is interpreted.

Some brief **performance numbers:** for the "count word frequencies" example shown above, Prig is about three times as fast as AWK (using Gawk): Prig counts a 43MB file in 1.1 seconds, Gawk in 3.1 seconds. Of course, at this point we're really comparing Go with Gawk (see much more detail in this [performance comparison](/writings/count-words/)).

For a CPU-bound task like adding number together, Go is of course much faster, about 20 times in this example (and remember that Go takes 200 of those 274 milliseconds to compile):

```
$ time gawk 'BEGIN { for (i=0; i<100000000; i++) s+=i; print s }'
4999999950000000

real    0m5.698s
...
$ time ./prig -b 's:=0; for i:=0; i<100000000; i++ { s+=i }; Println(s)'
4999999950000000

real    0m0.274s
...
```


## Resulting Go program

The [prig.go](https://github.com/benhoyt/prig/blob/master/prig.go) code itself is trivial: about 200 lines of Go code, about a third of which is to parse command line arguments. The rest just puts your script in a Go source template, runs `go build` to compile it, and then executes the result.

The basic structure of the resulting Go program is just what you'd expect: some setup code, the "begin" code, a `bufio.Scanner` loop over the lines with the "per-record" code, and then the "end" code. There's also the Prig built-in functions.

You can view the resulting Go source code with `prig -s`. Below is the "average value of last field" example from above. It's not quite verbatim; I've elided unused parts for brevity:

```
$ prig -s -b 's := 0.0' 's += F(NF())' -e 'Println(s / float64(NR()))'
// ... package and import ...
var (
    _output *bufio.Writer
    _record string
    _nr     int
    _fields []string
)

func main() {
    _output = bufio.NewWriter(os.Stdout)
    defer _output.Flush()

    // begin
    s := 0.0

    _scanner := bufio.NewScanner(os.Stdin)
    for _scanner.Scan() {
        _record = _scanner.Text()
        _nr++
        _fields = nil

        // per-record
        s += F(NF())
    }
    if _scanner.Err() != nil {
        _errorf("error reading stdin: %v", _scanner.Err())
    }

    // end
    Println(s / float64(NR()))
}

func Println(args ...interface{}) {
    _, err := fmt.Fprintln(_output, args...)
    if err != nil {
        _errorf("error writing output: %v", err)
    }
}

func NR() int {
    return _nr
}

func S(i int) string {
    if i == 0 {
        return _record
    }
    _ensureFields()
    if i < 1 || i > len(_fields) {
        return ""
    }
    return _fields[i-1]
}

func F(i int) float64 {
    s := S(i)
    f, _ := strconv.ParseFloat(s, 64)
    return f
}

func _ensureFields() {
    if _fields != nil {
        return
    }
    _fields = strings.Fields(_record)
}

func NF() int {
    _ensureFields()
    return len(_fields)
}
// ... other Prig builtin functions ...
```

Note how I've prefixed Prig internal names with underscore to avoid name clashes with variables the Prig user defines. Far from foolproof, but good enough for this use case.

The main loop is basically how you'd write the code manually in Go (though you'd probably use local variables instead of globals). However, in typical Go you'd likely write the `F(NF())` inline along with bounds checks, something like this inside the main loop:

```
if len(fields) > 0 {
    last := fields[len(fields)-1]
    f, err := strconv.ParseFloat(last, 64)
    if err == nil {
        s += f
    }
}
```

In this context it's nice to have Prig's `F()` do the bounds checking for you: `s += F(NF())` is a lot simpler than that 7-line chunk of verbosity. Go is verbose, but Go with a few well-placed helper functions can be very succinct!


## Fun with testing

Prig's tests (in [prig_test.go](https://github.com/benhoyt/prig/blob/master/prig_test.go)) are a bit unconventional in that they just run the `prig` binary. Some developers would balk at this, but it keeps Prig a bit simpler. The main tests are "table-driven tests", a staple of Go testing that you can [read about elsewhere](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests).

Due to the `go build` cycle, each test is relatively slow (on the order of 200 milliseconds), but the test suite still runs in 7-8 seconds on my system. It's a lot slower on Windows, where starting a new process is much heavier.


However, one of the neat things I did was to test the examples shown in `prig --help`. In writing the Prig [usage message](https://github.com/benhoyt/prig/blob/335e3d456ae7e0ea708312d6be212e6fbaad6d47/prig.go#L237), I kept making small typos in the examples, and had to keep copying and pasting them into my terminal to test them manually.

At some point I thought, why don't I test these examples automatically using `go test`? So I [extracted](https://github.com/benhoyt/prig/blob/335e3d456ae7e0ea708312d6be212e6fbaad6d47/prig.go#L290) the command line examples to separate strings that are tested in [`TestExamples`](https://github.com/benhoyt/prig/blob/335e3d456ae7e0ea708312d6be212e6fbaad6d47/prig_test.go#L370). I use an ad-hoc little [parser](https://github.com/benhoyt/prig/blob/335e3d456ae7e0ea708312d6be212e6fbaad6d47/prig_test.go#L399) to turn each example command line into an argument list, and then call `prig` on the result.

This is similar to Go's excellent [testable examples](https://go.dev/blog/examples), but for command-line examples instead of Go code examples.


## Experimenting with generics

One of the more difficult parts of Prig to design was the sorting helpers, and I'm still not at all sure I got them right. API design is an area where programming seems more like art than science.

In any case, I ended up with two functions that are useful on the data types I think you'd use with Prig. Here's what the rather terse usage message says:

```
Sort[T int|float64|string](s []T) []T
  // return new sorted slice; also Sort(s, Reverse) to sort descending
SortMap[T int|float64|string](m map[string]T) []KV[T]
  // return sorted slice of key-value pairs
  // also Sort(s[, Reverse][, ByValue]) to sort descending or by value
```

On Go 1.18 (which should be released very soon), these make use of the [new generics feature](https://tip.golang.org/doc/go1.18#generics), so they're type-checked and return a concrete slice type. Because of the optional parameters, the actual Go signatures (and the `KV` type) are defined as follows:

```
type _sortOption int

const (
    Reverse _sortOption = iota
    ByValue
)

func Sort[T int|float64|string](s []T, options ..._sortOption) []T {
    // ... implementation ...
}

type KV[T int|float64|string] struct {
    K string
    V T
}

func SortMap[T int|float64|string](m map[string]T,
        options ..._sortOption) []KV[T] {
    // ... implementation ...
}
```

`Sort` is simple enough: it takes a slice and returns a new sorted slice. It's sorted from low to high by default, or from high to low if you pass the `Reverse` option. I could have used a broader type set than just `int`, `float64`, and `string`, but this keeps it simple for Prig (and for the non-generic version that we'll look at below).

`SortMap` was a bit trickier to design an API for. You can't sort a Go map directly, so you need to convert it to a slice of key-value pairs: that's the `KV` type. You can sort by key (the default), or by value if you pass the `ByValue` option.

All this works okay, and my very limited experience with Go 1.18's generics was a success.

But what about most of us, who are still using pre-1.18 versions of Go without support for generics? Well, I made the same API work *without* generics ... kind of. The non-generic version uses `interface{}`, so it's not type safe, of course. And it only works at all without type conversions because you're often just printing the results; the `Print` family of functions already take any type of argument (via `interface{}`).

So the word-count example code works just as well on Go 1.18 (with generics) and Go 1.17 (without them):

```
for _, f := range SortMap(freqs, ByValue, Reverse) {
    Println(f.K, f.V)
}
```

Prig detects the Go version you have installed by running `go version`, and uses the non-generic version if it's 1.17 or below. Here's how the non-generic versions of `Sort` and `SortMap` are defined:

```
func Sort(s interface{}, options ..._sortOption) []interface{} {
    // ... implementation ...
}

type KV struct {
    K string
    V interface{}
}

func SortMap(m interface{}, options ..._sortOption) []KV {
    // ... implementation ...
}
```

Crazy? Probably. Most libraries could never get away with this kind of switcheroo, because the APIs just aren't compatible for a lot of tasks. But for an experiment in Prig, it seems to work pretty well.


## Conclusion: was it worth it?

I'm unashamedly a nerd at heart, so yes, I had fun building Prig (mostly on a flight from Christchurch to Frankfurt). I like how simple the code is: about 200 lines of Go code, 300 lines of template code ... and 400 lines of tests. Go and its standard library are doing all the hard work!

Would I use Prig for real? Possibly, if I'm processing large files and need a bit more performance than AWK can give me. I might also use it just for testing tiny snippets of Go code -- for example, "How do `Printf` widths work again? Ah yes, let's try it with `prig`":

```
$ prig -b 'Printf("%3.5s\n", "hi")'
 hi
$ prig -b 'Printf("%3.5s\n", "hello world")'
hello
```

Should you use Prig? I'm not going to stop you! But to be honest, you're probably better off learning the ubiquitous (and significantly terser) AWK language. It's a brilliant, 45-year-old tool that's still quite widely used for text and data processing in 2022. The original book by A, W, and K called [*The AWK Programming Language*](https://en.wikipedia.org/wiki/The_AWK_Programming_Language) is really good.

You might also use it if you need an *executable* for some data processing, for example in a lightweight container that doesn't have `awk` installed. For cases like this, you can use `prig -s` to print the source, `go build` the result, and copy the executable to the target -- no other dependencies needed.

If you want to integrate AWK into your Go programs, or just want to learn how an AWK interpreter works, check out my [GoAWK](https://github.com/benhoyt/goawk) project.

I'd love to hear your feedback about Prig: if you have any ideas for improvement, or if you make an `rp` or Prig variant in another language, do say hello!


{% include sponsor.html %}

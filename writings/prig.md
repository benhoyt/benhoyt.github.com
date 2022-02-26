---
layout: default
title: "Prig: like AWK, but snobbish (Go! static typing!)"
permalink: /writings/prig/
description: "Describes Prig, which is for Processing Records In Go. It's a text processing tool, like AWK, but it uses Go as the language."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2022</p>


> Summary: The article describes Prig, my AWK-like tool that uses the Go compiler for "scripting". I dive into what makes Prig different, as well as my experimentation with Go's new generics.


In a recent Hacker News [comment](https://news.ycombinator.com/item?id=30191430) I learned about [`rp`](https://github.com/c-blake/cligen/blob/master/examples/rp.nim), a little text processing tool kind of like AWK, but using Nim as the scripting language. The works because the Nim compiler is fast (and the Nim language is quite terse), so you can use Nim as a scripting language.

Go has one of those two things going for it: fast compile times. It definitely isn't terse, making it less than ideal for one-liner scripting. On the other hand, it's not terrible, either (Prig scripts are about twice as many characters as AWK scripts).

The author of `rp` suggested that new fast-compile languages like Nim and Go are ideal for this kind of tool. And the code to do it is almost trivial: a couple of hundred lines of code that inserts the user's command-line parameters into a source code template, compiles it, and then runs the result.

On my Linux machine, `go build` can build a zero-dependency "script" is about 200 milliseconds, so the startup time is very reasonable -- Go can compile and run a program almost before you've released the Enter key. For comparison, Nim compiles give a startup time of about 300ms on my system.

In any case, I decided to build an equivalent of `rp` in Go, and ended up with Prig, which is of course short for **P**rocessing **R**ecords **I**n **G**o.


## Prig compared to AWK

First of all, what does Prig look like, and how does that compare to AWK? Here are a few example scripts showing the kinds of things you might do with it.

Let's say you have a log file containing HTTP request lines, like so:

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

The `Println` function is just Go's `fmt.Println`, but using a buffered writer for efficiency. It's equivalent to AWK's `print` statement. The `S` function returns the given field number as a string, so `S(2)` returns the second field, like `$2` in AWK. The rest of the semantics are just regular Go semantics.

In AWK, the same script would look like this:

```
$ awk '{ print "https://example.com" $2 }' <logs.txt
https://example.com/robots.txt
...
```

Just 3 characters shorter -- not bad so far.

Here's where things start to get worse for Go. Below is a script, shown in both Prig and AWK variants, that prints the average value of last field by summing the field and then dividing by the number of records at the end:

```
$ cat avg.txt 
a b 400
c d 200
e f 200
g h 200

$ prig -b 's := 0.0' 's += F(NF())' -e 'Println(s / float64(NR()))' <avg.txt
250

$ awk '{ s += $NF } END { print s / NR }' <avg.txt
250
```

The script is 60 characters for Prig, 35 for AWK -- almost twice the length. Go (and many statically-typed languages) are at a disadvantage here. First we have to initialize our sum variable to 0; in AWK that's implicit.

Then we have the extra parentheses in `F(NF())` compard to AWK's cleaner `$NF`. I made a design decision early on to make all Prig builtins functions -- initially I had `NF` and `NR` as variables, but making them all functions means the code can split into fields lazily, only as needed (some simple scripts don't).

Then there's the `float64()` conversion, which along with the parentheses for `NR()` and `Println()`, mean Prig ends up looking a bit like Lisp in some cases. AWK's `print s / NR` is definitely easier on the eye!

Our third example prints the third field multiplied by 1000 (that is, in milliseconds) if the input line contains either of the strings `GET` or `HEAD`. Again, the Prig script compard to its AWK equivalent:

```
$ cat millis.txt 
1 GET 3.14159
2 HEAD 4.0
3 GET 1.0

$ prig 'if Match(`GET|HEAD`, S(0)) { Printf("%.0fms\n", F(3)*1000) }' <millis.txt
3142ms
4000ms
1000ms

$ awk '/GET|HEAD/ { printf "%.0fms\n", $3*1000 }' <millis.txt
3142ms
4000ms
1000ms
```

That's 62 characters in Prig, 43 in AWK -- not bad. The main difference here is the AWK `/regex/` shortcut. I thought about adding a special case for this in Prig, but I decided on simple, consistent Go over shortcuts -- so in Prig you have to do the `if` and `Match` explicitly.

Now a more-than-one-liner example. This is a script that counts the frequencies of unique words in the input and then prints the words and their counts, most frequent first.

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

In AWK, which doesn't have built-in sorting (only Gawk does), we use AWK's pipe redirect syntax to send it through the `sort` utility. We could have used the same technique with Prig using the shell's pipe features, but this shows how to use the `SortMap` function.

For most examples, **AWK is definitely clearer and less verbose** -- there was a reason Aho, Weinberger, and Kernighan designed a new language for AWK instead of using C (or similar) as the base language.

On the other hand, if you know Go well and don't know AWK, Prig might be useful for you. It's also significantly faster, because Go compiles to optimized machine code, whereas AWK is interpreted. (Related: see my [performance comparison](https://benhoyt.com/writings/count-words/) of counting word frequencies in Python, Go, C++, C, AWK, Forth, Rust, and others.)


## Resulting Go program

Prig itself is trivial: about 200 lines of Go code, about a third of which is to parse command line arguments. The rest just puts your script in a Go source template, runs `go build` to compile it, and then executes the result.

TODO: Basic structure of the resulting Go program

TODO: using -s to build a binary that you can reuse


## Experimenting with generics 

TODO: Sort/SortMap, and their Go 1.17 equivalents. Why this works when you're just using say Println.


## Fun with testing

TODO: tests are a bit unique in that they just run prig. Some people would hate this, but it keeps Prig simple. They're relatively slow, as each takes 200ms to call the `go build` step.

TODO: runnable examples from `prig -h` output.


## See also

GoAWK and AWKGo.


## Was it worth it?

I'm unashamedly a nerd at heart, so yes, I had fun building this. I like how simple the code is: about 200 lines of Go code, 300 lines of template code (oh, and 400 lines of tests). Go and its standard library are doing all the hard work!

Would I use Prig for real? Possibly, if I'm processing large files and need a bit more performance than AWK can give me. I might also use it just for testing tiny snippets of Go code -- for example, "How do `Printf` widths work again? Ah yes, let's try it with `prig`.":

```
$ prig -b 'Printf("%3.5s\n", "hi")'
 hi
$ prig -b 'Printf("%3.5s\n", "hello world")'
hello
```

Should you use it? I'm not going to stop you! But to be honest, you're probably better off learning the ubuiquitous (and significantly terser) AWK language.

You might also use if you need an *executable* for some data processing, for example in a lightweight container that doesn't have `awk` installed. For this case, you can use `prig -s` to print the source, `go build` that result, and copy the executable to the target -- no other dependencies needed.

In any case, I'd love to hear your feedback: if you have any ideas for improvement, or if you make an rp/Prig variant in another language, get in touch!


{% include sponsor.html %}

---
layout: default
title: "Rob Pike's simple C regex matcher in Go"
permalink: /writings/rob-pike-regex/
description: "Translating Rob Pike's simple and elegant C regex matcher to Go."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">August 2022</p>


Back in 1998, Rob Pike -- of Go and Plan 9 fame -- wrote a simple regular expression matcher in C for *The Practice of Programming*, a book he wrote with fellow Unix hacker Brian Kernighan. If you haven't read Kernighan's ["exegesis"](https://www.cs.princeton.edu/courses/archive/spr09/cos333/beautiful.html) of this code, it's definitely worth the 30-minute time investment it takes to go through that slowly.

With Go's C heritage (and Pike's influence on the Go language), I thought I'd see how well the C code would translate to Go, and whether it was still elegant.


## Original C version

First let's look at Pike's original matching code. It handles only a small number of regex metacharacters, namely `.`, `*`, `^`, and `$`, but it's a well-chosen subset that Kernighan says "easily accounts for 95 percent of all instances" of his day-to-day usage.

I just grepped my `.bash_history` for `grep` usage (how meta!) and my percentage is similar, though I also use escaped metacharacters (usually `\.`) in about 10% of uses.

Here is the original 35-line C matcher:


```c
/* match: search for regexp anywhere in text */
int match(char *regexp, char *text)
{
    if (regexp[0] == '^')
        return matchhere(regexp+1, text);
    do {    /* must look even if string is empty */
        if (matchhere(regexp, text))
            return 1;
    } while (*text++ != '\0');
    return 0;
}

/* matchhere: search for regexp at beginning of text */
int matchhere(char *regexp, char *text)
{
    if (regexp[0] == '\0')
        return 1;
    if (regexp[1] == '*')
        return matchstar(regexp[0], regexp+2, text);
    if (regexp[0] == '$' && regexp[1] == '\0')
        return *text == '\0';
    if (*text!='\0' && (regexp[0]=='.' || regexp[0]==*text))
        return matchhere(regexp+1, text+1);
    return 0;
}

/* matchstar: search for c*regexp at beginning of text */
int matchstar(int c, char *regexp, char *text)
{
    do {    /* a * matches zero or more instances */
        if (matchhere(regexp, text))
            return 1;
    } while (*text != '\0' && (*text++ == c || c == '.'));
    return 0;
}
```

Beautiful, right? I won't explain this code here; Kernighan does a far better job of it than I could in his ["A Regular Expression Matcher"](https://www.cs.princeton.edu/courses/archive/spr09/cos333/beautiful.html) article.


## Translation to Go

Strings in Go don't use `char*` pointers, of course, but string indexing and string slice operations such as `text[1:]` are a close match (so to speak).

As Kernighan points out, `do`-`while` is fairly rare in C, but it's necessary here. Probably for the better, Go doesn't have `do`-`while`, so I use an `if` statement inside the loop and return early instead. Besides, `do`-`while` wouldn't help us here because we still couldn't use fetch-and-increment expressions like `*text++`.

A number of things take more lines in Go, partly because of the lack of `do`-`while`, but also because you can't do one-line `if` statements without braces. However, I have converted the run of `if` statements in `matchHere` to a bare `switch`, which makes that function almost as terse as the C version.

A few things are simpler thanks to Go's strings, for example `regexp[0] == '$' && regexp[1] == '\0'` becomes just `regexp == "$"`.

So without further ado, here's my Go version ([full source here](https://github.com/benhoyt/repike/blob/master/repike.go)):

```go
// Match reports whether regexp matches anywhere in text.
func Match(regexp, text string) bool {
    if regexp != "" && regexp[0] == '^' {
        return matchHere(regexp[1:], text)
    }
    for {
        if matchHere(regexp, text) {
            return true
        }
        if text == "" {
            return false
        }
        text = text[1:]
    }
}

// matchHere reports whether regexp matches at beginning of text.
func matchHere(regexp, text string) bool {
    switch {
    case regexp == "":
        return true
    case regexp == "$":
        return text == ""
    case len(regexp) >= 2 && regexp[1] == '*':
        return matchStar(regexp[0], regexp[2:], text)
    case text != "" && (regexp[0] == '.' || regexp[0] == text[0]):
        return matchHere(regexp[1:], text[1:])
    }
    return false
}

// matchStar reports whether c*regexp matches at beginning of text.
func matchStar(c byte, regexp, text string) bool {
    for {
        if matchHere(regexp, text) {
            return true
        }
        if text == "" || (text[0] != c && c != '.') {
            return false
        }
        text = text[1:]
    }
}
```

It's 43 lines compared to 35. Thanks partly to Pike's influence on the language, I think the Go version still captures much of the elegance of his original C.

My first version was very slightly different (and 4 lines longer): I [simplified](https://github.com/benhoyt/repike/commit/45c498067faa47c28553c219f6dcfa1cb86fcc4a) a few things, including replacing the run of `if`s in `matchHere` with the `switch`. If you have any suggestions for how to make the Go code simpler or more elegant, let me know.

*Update: GitHub user [MoiTux](https://github.com/MoiTux) submitted a [PR](https://github.com/benhoyt/repike/pull/1) to shorten my version down to 37 lines. He put the `Match` and `matchStar` loop conditions and the `text = text[1:]` statement on the `for` line, and then called `matchHere` once more after the loop to handle the empty string case. [Full source here.](https://github.com/benhoyt/repike/blob/c89b143019894020344b55ad538d19f213bb8b7c/repike.go) Clever!*


## Testing

To ensure my Go version was correct, I added a bunch of table-driven [tests](https://github.com/benhoyt/repike/blob/master/repike_test.go) that (I believe) test the various edge cases. I run each test on my Go version as well as using Go's [`regexp`](https://pkg.go.dev/regexp) package. I also use [`os/exec`](https://pkg.go.dev/os/exec) to run each test against the original C version, and ensure the results are identical.

I use Go's sub-tests to do this; the `t.Run` calls set up a sub-test. To demonstrate this in action, I'm including the majority of the test code below:

```go
type test struct {
    name    string
    re      string
    text    string
    matched bool
}

var tests = []test{
    {"EmptyBoth", "", "", true},
    {"EmptyRegex", "", "foo", true},
    {"EmptyText", "foo", "", false},
    // ... snipped for brevity ...
}

func TestMatch(t *testing.T) {
    _, err := os.Stat("./matchc")
    haveC := err == nil // does the compiled C version exist?

    for _, test := range tests {
        // Ensure Go matcher passes.
        t.Run(test.name+"/repike", func(t *testing.T) {
            matched := repike.Match(test.re, test.text)
            if matched != test.matched {
                t.Fatalf("got %v, want %v", matched, test.matched)
            }
        })

        // Ensure test passes using Go's regexp package.
        t.Run(test.name+"/regexp", func(t *testing.T) {
            matched, err := regexp.MatchString(test.re, test.text)
            if err != nil {
                t.Fatalf("compile error: %v", err)
            }
            if matched != test.matched {
                t.Fatalf("got %v, want %v", matched, test.matched)
            }
        })

        // Ensure test passes using original C matcher.
        if haveC {
            t.Run(test.name+"/matchc", func(t *testing.T) {
                cmd := exec.Command("./matchc", test.re)
                cmd.Stdin = strings.NewReader(test.text + "\n")
                err := cmd.Run()
                // ... snipped for brevity ...
            })
        }
    }
}
```


## Benchmarks

I ran [benchmarks](https://github.com/benhoyt/repike/blob/master/benchmark.sh) of a grep-like matching program using each of the matchers (as well as `grep`), matching the regex `Ben.*H` over 100 concatenated repeats of the [King James Bible](https://www.gutenberg.org/ebooks/10).

I was pleasantly surprised to see that the Go translation is about the same speed as the original C version (compiled with `gcc -O2`). I guess the recursive structure of it means the generated code is fairly similar between the two.

Go's `regexp` package is [known](https://github.com/golang/go/issues/26623) to be slow, and it also handles Unicode correctly, so I had assumed it'd be at least as slow as the simple matchers. However, it's almost twice as fast. I'll leave it as an exercise for the reader why; my guess is that it's not recursive for this case, and recursive function calls are relatively slow.

Of course, GNU Grep is about three times as fast. For more on why GNU Grep is so fast, read [this classic FreeBSD mailing list post](https://lists.freebsd.org/pipermail/freebsd-current/2010-August/019310.html).

Here is a table of the results (best of five) on my laptop, from fastest to slowest:

Version    | Time (s)
---------  | --------
GNU grep   | 0.671
Go regexp  | 1.170
Go matcher | 2.180
C matcher  | 2.243

For the record, I'm using GCC version 11.2, Go version 1.18.1, and GNU Grep 3.7. My system is 64-bit Linux running a 2.6GHz i7-6700HQ CPU.


## Bonus: glob matcher

While getting distracted with this stuff, I also wrote a simple, 28-line glob matcher in Go that does `?` and `*` wildcard-style matching. It uses a similar implementation that loops through the pattern and text at the same time, with recursion for the `*` case.

Source code is below (also a [gist](https://gist.github.com/benhoyt/c3462407af4ab9591d59b79015c02d31)):

```go
func match(pattern, name string) bool {
    for pattern != "" {
        p := pattern[0]
        pattern = pattern[1:]
        switch p {
        case '*':
            for pattern != "" && pattern[0] == '*' {
                pattern = pattern[1:]
            }
            for i := 0; i <= len(name); i++ {
                if match(pattern, name[i:]) {
                    return true
                }
            }
            return false
        case '?':
            if name == "" {
                return false
            }
        default:
            if name == "" || p != name[0] {
                return false
            }
        }
        name = name[1:]
    }
    return name == ""
}
```


## Conclusion

I think Pike's code is useful, instructive, and beautiful. I certainly had fun reading Kernighan's article, porting the code, and writing this up, so I hope you enjoy it too.

Note that neither the C nor the Go version handles Unicode properly. It will work on UTF-8 input, but `.` and `c*` won't match multi-byte characters correctly (though in many cases that won't matter). The simplest way to fix this in the Go version would be to convert the `regexp` and `text` strings to slices of runes (`[]rune`) before beginning, and then use the same algorithm from there.

Of course, there are better ways to implement regex matching that don't have horrible run times on craftily-constructed regexes like `a.*a.*a.*a.a`, but you'll have to read Russ Cox's article ["Regular Expression Matching Can Be Simple And Fast"](https://swtch.com/~rsc/regexp/regexp1.html) for more on that.

Thanks for reading!


{% include sponsor.html %}

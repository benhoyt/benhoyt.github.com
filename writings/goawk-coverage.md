---
layout: default
title: "Code coverage for your AWK programs"
permalink: /writings/goawk-coverage/
description: "This article describes GoAWK's code coverage support, which was contributed by Volodymyr Gubarkov."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">November 2022</p>

Despite being the author of [GoAWK](https://github.com/benhoyt/goawk), I don't personally use AWK for multi-line scripts. I tend to use Python for scripting, and AWK for one-liners in the terminal.

However, some people do write longer programs using AWK, from the useful to the magnificent:

* [Gron.awk](https://github.com/xonixx/gron.awk), a clone of the JSON flattener, [Gron](https://github.com/tomnomnom/gron).
* [Makesure](https://github.com/xonixx/makesure), a Make-inspired build tool.
* [AWKTC](https://github.com/mikkun/AWKTC), a terminal-based Tetris game.
* [An old-skool demo](https://github.com/patsie75/awk-demo) that runs at 30 FPS in the terminal.

Gron.awk and Makesure are written by [Volodymyr Gubarkov](https://github.com/xonixx), a Ukranian developer who also created [intellij-awk](https://github.com/xonixx/intellij-awk), "The missing IntelliJ IDEA language support plugin for AWK".

A few months ago Volodymyr opened an [issue](https://github.com/benhoyt/goawk/issues/144) in the GoAWK repo saying that he was adding a code coverage feature to GoAWK, "similar to the one built into Golang itself". It's not every day that I get interesting submissions like that, plus, Volodymyr had already submitted several quality bug reports to the project, so I trusted his ability.

I also thought that it would be cool to be able to say that **GoAWK is the only AWK implementation we know with code coverage support.**

Thanks to Volodymyr's efforts, GoAWK [version 1.21.0](https://github.com/benhoyt/goawk/releases/tag/v1.21.0) includes the code coverage feature. There was [some](https://github.com/benhoyt/goawk/pull/148) [refactoring](https://github.com/benhoyt/goawk/pull/153) that needed to happen before the [main code change](https://github.com/benhoyt/goawk/pull/154) -- thanks again, Volodymyr, for having the patience to see this through.

If you're writing and testing larger AWK programs, you may find this useful! For some details on how to use the feature and how it works, I'll quote from the [coverage docs](https://github.com/benhoyt/goawk/blob/master/docs/cover.md):

Here is a screenshot using GoAWK's coverage feature on a simple AWK program (`prog.awk`):

![Example code coverage screenshot](https://github.com/benhoyt/goawk/raw/master/docs/cover.png)


### Basic usage

The simplest way to generate a coverage report is to run your AWK program with the `-coverprofile` option. To run the program in the default coverage mode and write the coverage report to `cover.out`, run the following:

```
$ goawk -f prog.awk -coverprofile cover.out
will always run
should run
```

This generates a file `cover.out` with coverage profile data for the execution of `prog.awk`.

We rely on the Go toolchain to visualize the coverage report, specifically the `go tool cover` command. This command renders a coverage report to HTML. If you don't have Go installed, [install it now](https://go.dev/doc/install).

To write the HTML coverage report (like the one shown in the screenshot above) to a temporary file and open a web browser displaying it, run the following:

```
$ go tool cover -html=cover.out
```

To write the HTML file to a specified file instead of launching a web browser, use `-o`:

```
$ go tool cover -html=cover.out -o cover.html
```

If you want to see coverage-annotated source code, use the `-d` option in addition to `-covermode`. This might be useful for debugging, or to see how GoAWK's coverage feature works under the hood:

```
$ goawk -f prog.awk -covermode set -d
BEGIN {
    __COVER["3"] = 1
    print "will always run"
    if ((1 + 1) == 2) {
        __COVER["1"] = 1
        print "should run"
    } else {
        __COVER["2"] = 1
        print "won't run"
    }
}
```


### All command-line options

- `-coverprofile fn`: set the coverage report filename to `fn`. If this option is specified but `-covermode` is not, the coverage mode defaults to `set`.
- `-covermode mode`: set the coverage mode to `mode`, which can be one of:
  - `set`: did each statement run?
  - `count`: how many times did each statement run? (produces a heat map report)
- `-coverappend`: append to coverage profile instead of overwriting it. This allows you to accumulate coverage data across several different runs of the program.

-----

Enjoy! Please report any bugs using [GitHub issues](https://github.com/benhoyt/goawk/issues).

{% include sponsor.html %}

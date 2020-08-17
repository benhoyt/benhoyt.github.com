---
layout: default
title: "Fuzzing in Go"
permalink: /writings/go-fuzzing/
description: "An overview of fuzz testing and the go-fuzz tool, as well as a look at the recent draft design for including fuzz testing in the built-in 'go test' command."
canonical_url: TODO
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
<p class="subtitle">August 2020</p>

> [Original article on LWN.net]({{ page.canonical_url }})

<style>
DIV.BigQuote {
    font-style: normal;
    font-weight: normal;
    color: darkred;
    background-color: white;
    margin-left: 1cm;
    margin-right: 1cm;
}
pre {
    font-size: 90%;
    word-spacing: 0;
}
span {
    color: darkred;
}
</style>


<!--
TODO - Previous LWN articles on fuzzing:
  - https://lwn.net/Articles/744269/ Jan 2018 "A survey of some free fuzzing tools"
  - https://lwn.net/Articles/735034/ Oct 2017 "More from the testing and fuzzing microconference"
  - https://lwn.net/Articles/710534/ Jan 2017 "Fuzzing open source"
  - https://lwn.net/Articles/705937/ Nov 2016 "A trio of fuzzers" (incl Dmitry Vyukov's Go-based "syzkaller")
  - https://lwn.net/Articles/685182/ Apr 2016 "Fuzzing filesystems with AFL"
  - https://lwn.net/Articles/677764/ Mar 2016 "Coverage-guided kernel fuzzing with syzkaller"
  - https://lwn.net/Articles/657959/ Sep 2015 "Fuzzing with american fuzzy lop"
  - https://lwn.net/Articles/653382/ Aug 2015 "Fuzzing perf_events"
-->


<p><a href="https://en.wikipedia.org/wiki/Fuzzing">Fuzzing</a> is a randomized testing technique used to find problematic edge cases or security issues in libraries that accept user input. <a href="https://golang.org/">Go</a> package developers can use fuzzing to find bugs with Dmitry Vyukov's popular <a href="https://github.com/dvyukov/go-fuzz">go-fuzz</a> tool, which has found <a href="https://github.com/dvyukov/go-fuzz#trophies">hundreds</a> of obscure bugs in the Go standard library as well as in third-party packages. However, this tool is not built in, and is not as simple to use as it could be &mdash; to address this, Katie Hockman on the Go team recently published a <a href="https://go.googlesource.com/proposal/+/master/design/draft-fuzzing.md">draft design</a> that proposes adding fuzz testing as a first-class feature of the standard <tt>go test</tt> command.</p>

<p>Using random test inputs to find bugs has a history that goes back to the days of punch cards. Author and long-time programmer Gerald Weinberg <a href="http://secretsofconsulting.blogspot.com/2017/02/fuzz-testing-and-fuzz-history.html">recollects</a>:</p>

<div class="BigQuote">
<p>We didn't call it fuzzing back in the 1950s, but it was our standard practice to test programs by inputting decks of punch cards taken from the trash. We also used decks of random number punch cards. We weren't networked in those days, so we weren't much worried about security, but our random/trash decks often turned up undesirable behavior.</p>
</div>

<p>More recently, fuzz testing has been used to find countless bugs, and some notable security issues, in software from <a href="https://lwn.net/Articles/657959/">Bash and libjpeg</a> to the <a href="https://lwn.net/Articles/677764/">Linux kernel</a>, using tools such as <a href="https://lcamtuf.coredump.cx/afl/">american fuzzy lop (AFL)</a> and Vyukov's Go-based <a href="https://github.com/google/syzkaller">syzcaller</a> tool.</p>

<p>The basic idea of fuzz testing is to generate random inputs for a function and see if it crashes or raises an exception that is not part of the function's API. However, using a naive method to generate random inputs is extremely time-consuming, and doesn't find edge cases efficiently. That is why most modern fuzzing tools use "coverage-guided fuzzing" to drive the testing and determine whether newly-generated inputs are executing new code paths. Vyukov's <a href="https://docs.google.com/document/u/1/d/1zXR-TFL3BfnceEAWytV8bnzB2Tfp6EPFinWVJ5V4QC8/pub">description</a> of how this technique works is very succinct:</p>

<pre>
    start with some (potentially empty) corpus of inputs
    for {
        choose a random input from the corpus
        mutate the input
        execute the mutated input and collect code coverage
        if the input gives new coverage, add it to the corpus
    }
</pre>

<p>Collecting code coverage data and detecting when an input "gives new coverage" is not trivial, and requires the tool to instrument code with special calls to a coverage recorder. When the instrumented code runs, it compares code coverage from one test input with coverage from a new input, and if more code blocks have been executed, it adds that new input to the corpus. Obviously this glosses over a lot of details, such as how the input is mutated, how exactly the coverage instrumentation works, and so on. But the basic technique is effective: AFL <a href="https://lcamtuf.coredump.cx/afl/README.txt">has used it</a> on many C and C++ programs, and has a <a href="https://lcamtuf.coredump.cx/afl/#bugs">section</a> on its web page listing the huge number of libraries that have had bugs found and fixed.</p>


<h4>The go-fuzz tool</h4>

<p>AFL is an excellent tool, but it only works for programs written in C, C++, or Objective C, and those programs need to be compiled with gcc or clang. Vyukov's go-fuzz tool operates in a similar way to AFL, but is written specifically for Go. The first step is the <tt>go-fuzz-build</tt> command, which uses the built-in <a href="https://golang.org/pkg/go/ast/">ast</a> package when building a test binary to <a href="https://github.com/dvyukov/go-fuzz/blob/master/go-fuzz-build/cover.go">add coverage recording</a> to each block in the source code, and sends the result through the regular Go compiler. Once the instrumented binary has been built, the <tt>go-fuzz</tt> command runs this instrumented binary over and over on multiple CPU cores with <a href="https://github.com/dvyukov/go-fuzz/blob/master/go-fuzz/mutator.go">randomly mutating</a> inputs, recording any crashes (and their stack traces) as it goes.</p>

<p>Go developer Damian Gryski has written a <a href="https://medium.com/@dgryski/go-fuzz-github-com-arolek-ase-3c74d5a3150c">tutorial</a> showing how to use the go-fuzz tool in more detail. As mentioned, go-fuzz has found (and led to fixes for) many bugs in Go packages: those found in the standard library are <a href="https://github.com/dvyukov/go-fuzz#trophies">listed</a> in the tool's README, as are many bugs in third-party packages. However, there are almost certainly many more in third-party packages that aren't listed there; I personally <a href="https://benhoyt.com/writings/goawk/#fuzz-testing">used</a> go-fuzz on GoAWK and it found several "crashers".</p>


<h4>Journey to first class</h4>

<p>Go has a built-in command, <tt>go test</tt>, that automatically finds and runs a project's tests (and, optionally, benchmarks). Fuzzing is a type of testing, but without built-in tool support it is somewhat cumbersome to set up. Back in February 2017 an <a href="https://github.com/golang/go/issues/19109">issue</a> was filed on the Go GitHub repository on behalf of Vyukov and Google researcher <a href="https://research.google/people/KonstantinSerebryany/">Konstantin Serebryany</a>, proposing that the <tt>go</tt> tool "<span>support fuzzing natively, just like it does tests and benchmarks and race detection today</span>". The issue notes that "<span>go-fuzz exists but it's not as easy as writing tests and benchmarks and running <tt>go test -race</tt></span>". This issue has garnered a huge amount of support and many comments.</p>

<p>At some point Vyukov added a <a href="https://docs.google.com/document/d/1N-12_6YBPpF9o4_Zys_E_ZQndmD06wQVAM_0y9nZUIE/edit">motivation document</a> as well as an <a href="https://docs.google.com/document/u/1/d/1zXR-TFL3BfnceEAWytV8bnzB2Tfp6EPFinWVJ5V4QC8/pub">API and tooling proposal</a> for what such an integration would look like. Go tech lead Russ Cox pressed for a prototype version of "<span>exactly what you want the new go test fuzz mode to be</span>". In January 2019 "thepudds" <a href="https://github.com/golang/go/issues/19109#issuecomment-451871672">shared</a> just that &mdash; a tool called <a href="https://github.com/thepudds/fzgo">fzgo</a> that implements most of the original proposal in a separate tool. This was well received at the time, but does not seem to have turned into anything official.</p>

<p>More recently, however, the Go team has picked this back up, with Hockman writing the recent draft design for first-class fuzzing. The goal is similar, to make it easy to run fuzz tests with the standard <tt>go test</tt> tool, but the proposed API is slightly more complex to allow seeding the initial corpus programmatically, and to support types other than byte strings.</p>

<p>Currently developers can write test functions with the signature <tt>TestFoo(t *testing.T)</tt> in a <tt>*_test.go</tt> source file, and <tt>go test</tt> will automatically run those functions as unit tests. The new draft design adds the ability to write <tt>FuzzFoo()</tt> fuzz tests in a similar way, and then run them using a simple command like <tt>go test -fuzz</tt>. Here is an example that might be part of <tt>calc_test.go</tt> in a calculator library:</p>

<pre>
    func FuzzEval(f *testing.F) {
        // Seed the initial corpus
        f.Add("1+2")
        f.Add("1+2*3")
        f.Add("(1+2)*3")

        // Run the fuzz test
        f.Fuzz(func(t *testing.T, expr string) {
            t.Parallel()      // allow parallel execution
            _, _ = Eval(expr) // function under test (discard result and error)
        }
    }
</pre>

<p>Just these few lines of code form a basic fuzz test that will ensure that the calculator library's <tt>Eval()</tt> function does not crash ("panic" in Go terminology). Some examples of panics are out-of-bounds array access, dereferencing a nil pointer, or division by zero. A more involved fuzz test might compare the result against another library (called <tt>calclib</tt> in this example):</p>

<pre>
    func FuzzEval(f *testing.F) {
        // Seed the initial corpus
        f.Add("1+2")
        f.Add("1+2*3")
        f.Add("(1+2)*3")

        // Run the fuzz test
        f.Fuzz(func(t *testing.T, expr string) {
            t.Parallel()
            r1, err := Eval(expr)
            if err != nil {
                t.Skip() // got parse error, skip rest of test
            }

            // Compare result against calclib
            r2, err := calclib.Eval(expr)
            if err != nil {
                t.Errorf("Eval succeeded but calclib had error: %v", err)
            }
            if r1 != r2 {
                t.Errorf("Eval got %d, calclib got %d", r1, r2)
            }
        }
    }
</pre>


<h4>Discussion and what's next</h4>

<p>As with the recent draft design on <a href="https://lwn.net/Articles/827215/">filesystems and file embedding</a>, official discussion for this design was done using a <a href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/">Reddit thread</a>. The feedback was quite positive, with <a href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fywx1ag/">some discussion</a> about whether <tt>testing.F</tt> should implement the existing <tt>testing.TB</tt> interface (and Hockman <a href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/g0c0mg0/">updated</a> the design to implement that), <a href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fyusyke/">bikeshedding</a> over whether the command should be spelled <tt>go test -fuzz</tt> or <tt>go fuzz</tt>, and <a href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fyvtms0/">comments</a> on whether the mutation engine needs to be pluggable for the initial release.</p>

<p>It's hard to say what the next steps will be and when they will happen, but it is good to see some official oomph being put behind this from the Go team. Based on Cox's feedback on Vyukov's original proposal, my guess is that we'll see a prototype of the updated proposal being developed on a branch, or in a separate tool that developers can run as something like <tt>fuzzgo test -fuzz</tt>.</p>

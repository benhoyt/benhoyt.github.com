---
layout: default
title: "Fuzzing in Go"
permalink: /writings/go-fuzzing/
description: "An overview of fuzz testing and the go-fuzz tool, as well as a look at the recent draft design for including fuzz testing in the built-in 'go test' command."
canonical_url: https://lwn.net/Articles/829242/
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


<p><a href="https://en.wikipedia.org/wiki/Fuzzing">Fuzzing</a> is a testing
technique with randomized inputs that is used to find problematic edge
cases or security problems in code that accepts user input. <a
href="https://golang.org/">Go</a> package developers can use Dmitry Vyukov's popular <a
href="https://github.com/dvyukov/go-fuzz">go-fuzz</a> tool for fuzz testing
their code; it has found
<a href="https://github.com/dvyukov/go-fuzz#trophies">hundreds</a> of
obscure bugs in the Go standard library as well as in third-party
packages. However, this tool is not built in, and is not as simple to use
as it could be; to address this, Go team member Katie Hockman
recently published a <a
href="https://go.googlesource.com/proposal/+/master/design/draft-fuzzing.md">draft
design</a> that proposes adding fuzz testing as a first-class feature of
the standard <tt>go&nbsp;test</tt> command.</p> 

<p>Using random test inputs to find bugs has a history that goes back to
the days of punch cards. Author and long-time programmer Gerald Weinberg <a
href="http://secretsofconsulting.blogspot.com/2017/02/fuzz-testing-and-fuzz-history.html">recollects</a>:</p> 

<div class="BigQuote">
<p>We didn't call it fuzzing back in the 1950s, but it was our standard
practice to test programs by inputting decks of punch cards taken from the
trash. We also used decks of random number punch cards. We weren't
networked in those days, so we weren't much worried about security, but our
random/trash decks often turned up undesirable behavior.</p> 
</div>

<p>More recently, fuzz testing has been used to find countless bugs, and
some notable security issues, in software from <a
href="https://lwn.net/Articles/657959/">Bash and libjpeg</a> to the <a
href="https://lwn.net/Articles/677764/">Linux kernel</a>, using tools such
as <a href="https://lcamtuf.coredump.cx/afl/">american fuzzy lop (AFL)</a>
and Vyukov's Go-based <a
href="https://github.com/google/syzkaller">syzkaller</a> tool.</p> 

<p>The basic idea of fuzz testing is to generate random inputs for a
function to see if it crashes or raises an exception that is not part of
the function's API. However, using a naive method to generate random inputs
is extremely time-consuming, and doesn't find edge cases efficiently. That
is why most modern fuzzing tools use "coverage-guided fuzzing" to drive the
testing and determine whether newly-generated inputs are executing new code
paths. Vyukov co-authored a <a
href="https://docs.google.com/document/u/1/d/1zXR-TFL3BfnceEAWytV8bnzB2Tfp6EPFinWVJ5V4QC8/pub">proposal</a>
which has a succinct description of how this technique works:</p> 

<div class="BigQuote">
<pre>
start with some (potentially empty) corpus of inputs
for {
    choose a random input from the corpus
    mutate the input
    execute the mutated input and collect code coverage
    if the input gives new coverage, add it to the corpus
}
</pre>
</div>

<p>Collecting code coverage data and detecting when an input "gives new
coverage" is not trivial; it requires a tool to instrument code with
special calls to a coverage recorder. When the instrumented code runs, the
fuzzing framework
compares code coverage from previous test inputs with coverage from a new input,
and if different code blocks have been executed, it adds that new input to
the corpus. Obviously this glosses over a lot of details, such as how the
input is mutated, how exactly the coverage instrumentation works, and so
on. But the basic technique is effective: AFL <a
href="https://lcamtuf.coredump.cx/afl/README.txt">has used it</a> on many C
and C++ programs, and has a <a
href="https://lcamtuf.coredump.cx/afl/#bugs">section</a> on its web page
listing the huge number of bugs found and fixed.</p> 


<h4>The go-fuzz tool</h4>

<p>AFL is an excellent tool, but it only works for programs written in C,
C++, or Objective C, which need to be compiled with GCC or
Clang. Vyukov's go-fuzz tool operates in a similar way to AFL, but is
written specifically for Go. In order to add coverage recording to a Go
program, a developer first runs the <tt>go-fuzz-build</tt> command (instead
of <tt>go&nbsp;build</tt>), which uses the built-in <a
href="https://golang.org/pkg/go/ast/">ast</a> package to add <a
href="https://github.com/dvyukov/go-fuzz/blob/master/go-fuzz-build/cover.go">instrumentation</a>
to each block in the source code, and sends the result through the regular
Go compiler. Once the instrumented binary has been built, the
<tt>go-fuzz</tt> command runs it over and over on multiple CPU cores with
<a
href="https://github.com/dvyukov/go-fuzz/blob/master/go-fuzz/mutator.go">randomly
mutating</a> inputs, recording any crashes (along with their stack traces
and the inputs that caused them) as it
goes.</p> 

<p>Damian Gryski has written a <a
href="https://medium.com/@dgryski/go-fuzz-github-com-arolek-ase-3c74d5a3150c">tutorial</a>
showing how to use the go-fuzz tool in more detail. As mentioned, the
go-fuzz README lists the many bugs it has found, however, there are almost
certainly many more in third-party packages that have not been listed
there; I personally <a
href="https://benhoyt.com/writings/goawk/#fuzz-testing">used</a> go-fuzz on
GoAWK and it found several "crashers".</p> 


<h4>Journey to first class</h4>

<p>Go has a built-in command, <tt>go&nbsp;test</tt>, that automatically finds
and runs a project's tests (and, optionally, benchmarks). Fuzzing is a type
of testing, but without built-in tool support it is somewhat cumbersome to
set up. Back in February 2017, an <a
href="https://github.com/golang/go/issues/19109">issue</a> was filed on the
Go GitHub repository on behalf of Vyukov and <a
href="https://research.google/people/KonstantinSerebryany/">Konstantin
Serebryany</a>, proposing that the <tt>go</tt> tool "<span>support fuzzing
natively, just like it does tests and benchmarks and race detection
today</span>". The issue notes that "<span>go-fuzz exists but it's not as
easy as writing tests and benchmarks and running
<tt>go&nbsp;test&nbsp;-race</tt></span>". This issue has garnered a huge
amount of support and 
many comments.</p> 

<p>At some point Vyukov and others added a <a
href="https://docs.google.com/document/d/1N-12_6YBPpF9o4_Zys_E_ZQndmD06wQVAM_0y9nZUIE/edit">motivation
document</a> as well as the <a
href="https://docs.google.com/document/u/1/d/1zXR-TFL3BfnceEAWytV8bnzB2Tfp6EPFinWVJ5V4QC8/pub">API
and tooling proposal</a> for what such an integration would look like. Go
tech lead Russ Cox pressed for a prototype version of "<span>exactly what
you want the new go test fuzz mode to be</span>". In January 2019
"thepudds" <a
href="https://github.com/golang/go/issues/19109#issuecomment-451871672">shared</a>
just that &mdash; a tool called <a
href="https://github.com/thepudds/fzgo">fzgo</a> that implements most of
the original proposal in a separate tool. This was well-received at the
time, but does not seem to have turned into anything official.</p> 

<p>More recently, however, the Go team has picked this idea back up, with
Hockman writing the recent draft design for first-class fuzzing. The goal
is similar, to make it easy to run fuzz tests with the standard
<tt>go&nbsp;test</tt> tool, but the proposed API is slightly more complex
to allow 
seeding the initial corpus programmatically and to support input types
other than byte strings ("slice of byte" or <tt>[]byte</tt> in Go).</p> 

<p>Currently, developers can write test functions with the signature
<tt>TestFoo(t&nbsp;*testing.T)</tt> in a <tt>*_test.go</tt> source file, and
<tt>go&nbsp;test</tt> will automatically run those functions as unit tests. The
existing <a href="https://golang.org/pkg/testing/#T"><tt>testing.T</tt></a>
type is passed to test functions to control the test and record
failures. The new draft design adds the ability to write
<tt>FuzzFoo(f&nbsp;*testing.F)</tt> fuzz tests
in a similar way
and then run them using a simple command like <tt>go&nbsp;test&nbsp;-fuzz</tt>. The
proposed <tt>testing.F</tt> type is used to add inputs to the seed corpus
and implement the fuzz test itself (using a nested anonymous
function). Here is an example that might be part of <tt>calc_test.go</tt>
for a calculator library:</p> 

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
        })
    }
</pre>

<p>Just these few lines of code form a basic fuzz test that will run the
calculator library's <tt>Eval()</tt> function with randomized inputs and
record any crashes ("panics" in Go terminology). Some examples of panics
are out-of-bounds array access, dereferencing a nil pointer, or division by
zero. A more involved fuzz test might compare the result against another
library (called <tt>calclib</tt> in this example):</p> 

<pre>
        ...

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
        })
    }
</pre>

<p>In addition to describing fuzzing functions and the new
<tt>testing.F</tt> type, Hockman's draft design <a
href="https://go.googlesource.com/proposal/+/master/design/draft-fuzzing.md#fuzzing-engine-and-mutator">proposes</a>
that a new coverage-guided fuzzing engine be built that "<span>will be
responsible for using compiler instrumentation to understand coverage
information, generating test arguments with a mutator, and maintaining the
corpus</span>". Hockman <a
href="https://go.googlesource.com/proposal/+/master/design/draft-fuzzing.md#implementation">makes
it clear</a> that this would be a new implementation, but would draw
heavily from existing work (go-fuzz and fzgo). The mutator would generate
new randomized inputs (the "generated corpus") from existing inputs, and
would work automatically for built-in types or structs composed of built-in
types. Other types would also be supported if they implemented the existing
<a
href="https://golang.org/pkg/encoding/#BinaryUnmarshaler"><tt>BinaryUnmarshaler</tt></a>
or <a
href="https://golang.org/pkg/encoding/#TextUnmarshaler"><tt>TextUnmarshaler</tt></a>
interfaces.</p> 

<p>By default, the engine would run fuzz tests indefinitely, stopping a
particular test run when the first crash is found. Users will be able to
tell it to run for a certain duration with the <tt>-fuzztime</tt> command
line flag (for use in continuous integration scripts), and tell it to keep
running after crashes with the <tt>-keepfuzzing</tt> flag. <a
href="https://go.googlesource.com/proposal/+/master/design/draft-fuzzing.md#crashers">Crash
reports</a> will be written to files in a <tt>testdata</tt> directory, and
will contain the inputs that caused the crash as well as the error message
or stack trace.</p> 


<h4>Discussion and what's next</h4>

<p>As with the recent draft design on <a
href="https://lwn.net/Articles/827215/">filesystems and file embedding</a>,
official discussion for this design was done using a <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/">Reddit
thread</a>; overall, the feedback was positive.</p> 

<p>There was some discussion about the <tt>testing.F</tt> interface. David
Crawshaw <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fywx1ag/">suggested</a>
that it should implement the existing <a
href="https://golang.org/pkg/testing/#TB"><tt>testing.TB</tt></a> interface
for consistency with <tt>testing.T</tt> and <a
href="https://golang.org/pkg/testing/#B"><tt>testing.B</tt></a> (used for
benchmarking); Hockman agreed, <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/g0c0mg0/">updating</a>
the design to reflect that. Based on a <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fyusyke/">suggestion</a>
by "etherealflaim", Hockman also <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/g0c0djh/">updated</a>
the design to avoid reusing <tt>testing.F</tt> in both the top level and
the fuzz function.  There was also some <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fyusyke/">bikeshedding</a>
over whether the command should be spelled <tt>go&nbsp;test&nbsp;-fuzz</tt> or <tt>go
fuzz</tt>; etherealflaim suggested that reusing <tt>go&nbsp;test</tt>
would be a bad idea because the it "<span>has history and lots of folks
have configured timeouts for it and such</span>".</p> 

<p>Jeremy Bowers <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fyvtms0/">recommended</a>
that the mutation engine should be pluggable:</p> 

<div class="BigQuote">
<p>I think the fuzz engine needs to be pluggable. Certainly a default one
can be shipped, and pluggability can even be pushed to a "version 2", but I
think it ought to be in the plan. Fuzzing can be one-size-fits-most but
there's always going to be the need for more specialized stuff.</p> 
</div>

<p>Hockman, however, <a
href="https://old.reddit.com/r/golang/comments/hvpr96/design_draft_first_class_fuzzing/fywtk8u/">responded</a>
that pluggability is not required in order to add the feature, but might be
"<span>considered later in the design phase</span>".</p> 

<p>The draft design states up front that "<span>the goal of circulating this
draft design is to collect feedback to shape an intended eventual
proposal</span>", so it's hard to say exactly what the next steps will be
and when they will happen. However, it is good to see some official energy
being put behind this from the Go team. Based on Cox's feedback on Vyukov's
original proposal, my guess is that we'll see a prototype of the updated
proposal being developed on a branch, or in a separate tool that developers
can run, similar to fzgo.</p> 

<p>Discussion on the Reddit thread is ongoing, so it seems unlikely that a
formal proposal and an implementation for a feature this large would be
ready when the Go 1.16 <a
href="https://github.com/golang/go/wiki/Go-Release-Cycle">release
freeze</a> hits in November 2020. Inclusion in Go 1.17, due out in August
2021, would be more likely.</p>

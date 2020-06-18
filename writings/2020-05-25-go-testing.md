---
layout: default
title: "Testing in Go: philosophy and tools"
permalink: /writings/go-testing/
description: "Go's philosophy of testing and an overview of the built-in testing tools."
canonical_url: https://lwn.net/Articles/821358/
---
<h1>{{ page.title }}</h1>
<p class="subtitle">May 2020</p>

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
</style>


<p>The <a href="https://golang.org/">Go programming language</a> comes with
tools for writing and running tests: the standard library's <a
href="https://golang.org/pkg/testing/"><tt>testing</tt></a> package, and
the <a href="https://golang.org/pkg/cmd/go/internal/test/"><tt>go
test</tt></a> command to run test suites. Like the language itself, Go's
philosophy for writing tests is minimalist: use the
lightweight <tt>testing</tt> package along with helper functions
written in plain Go. The idea is that tests are just code, and since a Go
developer already knows how to write Go using its abstractions and types,
there's no need to learn a quirky domain-specific language for writing
tests.</p>

<p><a href="https://www.gopl.io/"><i>The Go Programming Language</i></a> by
Brian Kernighan and Alan Donovan summarizes this philosophy. From chapter
11 on testing:</p>

<div class="BigQuote">
<p>Many newcomers to Go are surprised by the minimalism of Go's testing
framework. Other languages' frameworks provide mechanisms for identifying
test functions (often using reflection or metadata), hooks for performing
"setup" and "teardown" operations before and after the tests run, and
libraries of utility functions for asserting common predicates, comparing
values, formatting error messages, and aborting a failed test (often using
exceptions). Although these mechanisms can make tests very concise, the
resulting tests often seem like they are written in a foreign language.</p>
</div>

<p>To see this in practice, here's  a simple test of the
absolute value function <tt>Abs()</tt> using
the <tt>testing</tt> package and plain Go:</p>

<pre>
    func TestAbs(t *testing.T) {
        got := Abs(-1)
        if got != 1 {
            t.Errorf("Abs(-1) = %d; want 1", got)
        }
    }
</pre>

<p>Contrast that with the following version, written using the popular
(though I would argue non-idiomatic) <a
href="https://onsi.github.io/ginkgo/">Ginkgo</a> library that provides a
means to
write <a href="https://rspec.info/">RSpec</a>-style tests for Go:</p>

<pre>
    Describe("Abs", func() {
        It("returns correct abs value for -1", func() {
            got := Abs(-1)
            Expect(got).To(Equal(1))
        })
    })
</pre>

<p>The functions <tt>Describe</tt>, <tt>Expect</tt>, etc, make the test
"read like English", but means that there is suddenly a whole new sub-language to
learn. The thinking of Go contributors such as Donovan is that there are already
tools like <tt>==</tt> and <tt>!=</tt> built into the language, so why
is <tt>To(Equal(x))</tt> needed?</p>

<p>That said, Go doesn't stop developers from using such libraries, so developers
coming from other languages often find using them more familiar than
vanilla <tt>testing</tt>. One relatively lightweight library is <a
href="https://github.com/stretchr/testify#assert-package">testify/assert</a>,
which adds common assertion functions like <tt>assert.Equal()</tt>, and <a
href="https://github.com/stretchr/testify#suite-package">testify/suite</a>,
which adds test-suite utilities like setup and teardown. The "Awesome Go"
website provides an <a href="https://awesome-go.com/#testing">extensive
list</a> of such third-party packages.</p>

<p>One useful testing tool that's not part of the <tt>testing</tt> package is
<tt>reflect.DeepEqual()</tt>, which is a standard library function that uses
reflection to determine "deep equality", that is, equality after following
pointers and recursing into maps, arrays, and so on. This is helpful when
tests compare things like JSON objects or structs with pointers in
them. Two libraries that build on this are Google's <a
href="https://github.com/google/go-cmp">go-cmp</a> package and Daniel
Nichter's <a href="https://github.com/go-test/deep">deep</a>, which are
like <tt>DeepEqual</tt> but produce a human-readable diff of what's not
equal rather just returning a boolean. For example, here's a (deliberately broken) test
of a <tt>MakeUsers()</tt> function using go-cmp:</p>

<pre>
    func TestMakeUser(t *testing.T) {
        got := MakeUser("Bob Smith", "bobby@example.com", 42)
        want := &amp;User{
            Name:  "Bob Smith",
            Email: "bob@example.com",
            Age:   42,
        }
        if diff := cmp.Diff(want, got); diff != "" {
            t.Errorf("MakeUser() mismatch (-want +got):\n%s", diff)
        }
    }
</pre>

<p>And the human-readable output is:</p>

<pre>
    user_test.go:16: MakeUser() mismatch (-want +got):
          &amp;main.User{
            Name:  "Bob Smith",
        -   Email: "bob@example.com",
        +   Email: "bobby@example.com",
            Age:   42,
          }
</pre>


<h4>Built-in <tt>testing</tt> features</h4>

<p>The built-in <tt>testing</tt> package contains various functions to
log information and report failures, skip tests at runtime, or only run
tests in "short" mode. Short mode provides a way to <a
href="https://golang.org/pkg/testing/#hdr-Skipping">skip</a> tests that are
long running or have a lot of setup, which can be helpful during
development. It is enabled using the <tt>-test.short</tt>
command line argument.</p>

<p>Go's test runner executes tests sequentially by default, but there's an
opt-in <tt>Parallel()</tt> function to allow running explicitly-marked
tests at the same time across multiple cores.</p>

<p>In Go 1.14, the <tt>testing</tt> package added a <a
href="https://golang.org/pkg/testing/#T.Cleanup"><tt>Cleanup()</tt></a>
function that registers a function to be called when the test
completes. This is a built-in way to simplify teardown, for example to
delete database tables after a test finishes:</p>

<pre>
    func createDatabase(t *testing.T) {
        // ... code to create a test database
        t.Cleanup(func() {
            // ... code to delete the test database
            // runs when the test finishes (success or failure)
        })
    }

    func TestFetchUser(t *testing.T) {
        createDatabase(t) // creates database and registers cleanup
        user, err := FetchUser("bob@example.com")
        if err != nil {
            t.Fatalf("error fetching user: %v", err)
        }
        expected := &amp;User{"Bob Smith", "bob@example.com", 42}
        if !reflect.DeepEqual(user, expected) {
            t.Fatalf("expected user %v, got %v", expected, user)
        }
    }
</pre>

<p><a href="https://lwn.net/Articles/820217/">Go 1.15</a> is adding a test
helper, <a
href="https://tip.golang.org/pkg/testing/#T.TempDir"><tt>TempDir()</tt></a>,
that creates (and cleans up) a temporary directory for the current
test. There's a high bar for adding to the <tt>testing</tt> package, but
Russ Cox on the core Go team <a
href="https://github.com/golang/go/issues/35998#issuecomment-603983588">gave
his approval</a> for this addition:
"<span>It seems like temporary directories do come up in
a large enough variety of tests to be part of <tt>testing</tt> proper.</span>"</p>

<h4>Table-driven tests</h4>

<p>A common idiom in Go to avoid repetition when testing various edge cases
is called "table-driven tests". This technique iterates over the test cases
in a "<a href="https://golang.org/doc/effective_go.html#slices">slice</a>"
(Go's term for a view into a resizable array), reporting any failures for each iteration:</p>

<pre>
    func TestAbs(t *testing.T) {
        tests := []struct {
            input    int
            expected int
        }{
            {1, 1},
            {0, 0},
            {-1, 1},
            {-maxInt, maxInt},
            {maxInt, maxInt},
        }
        for _, test := range tests {
            actual := Abs(test.input)
            if actual != test.expected {
                t.Errorf("Abs(%d) = %d; want %d", test.input, actual, test.expected)
            }
        }
    }
</pre>

<p>The <tt>t.Errorf()</tt> calls report the failure but do not stop the
execution of the test, so multiple failures can be reported. This style of
table-driven test is common throughout the standard library tests (for
example, the <a href="https://golang.org/src/fmt/fmt_test.go#L142">fmt
tests</a>). <a
href="https://blog.golang.org/subtests">Subtests</a>, a feature introduced
in Go 1.7,  gives the ability to run individual sub-tests from the
command line, as well as better control over failures and parallelism.</p>


<h4>Mocks and interfaces</h4>

<p>One of Go's well-known language features is its structurally-typed
<a
href="https://golang.org/doc/effective_go.html#interfaces">interfaces</a>,
sometimes referred to as "<a 
href="https://blog.carbonfive.com/structural-typing-compile-time-duck-typing/">compile-time
duck typing</a>". "<span>Interfaces in Go provide a way to specify the
behavior of an object: if something can do <i>this</i>, then it can be used
<i>here</i>.</span>" Interfaces are important whenever there is a need to vary
behavior at runtime, which of course includes testing. For example, as Go
core contributor Andrew Gerrand said in the <a
href="https://talks.golang.org/2014/testing.slide#22">slides</a> for  his 2014  "Testing
Techniques" talk, a file-format parser should not have a
concrete file type passed in like this:</p>

<pre>
    func Parse(f *os.File) error { ... }
</pre>

<p>Instead, <tt>Parse()</tt> should simply take a small interface that only implements
the functionality needed. In cases like this, the ubiquitous <a
href="https://golang.org/pkg/io/#Reader"><tt>io.Reader</tt></a> is a good
choice:</p>

<pre>
    func Parse(r io.Reader) error { ... }
</pre>

<p>That way, the parser can be fed anything that implements
<tt>io.Reader</tt>, which includes files, string buffers, and network
connections. It also makes it much easier to test (probably using a <a
href="https://golang.org/pkg/strings/#Reader"><tt>strings.Reader</tt></a>).</p>

<p>If the tests only use a small part of a large interface, for example
one method from a multi-method API, a new struct type can be
created that <a
href="https://golang.org/doc/effective_go.html#embedding">embeds</a> the  
interface to fulfill the API contract, and only overrides the method
being called. A full example of this technique is shown in <a
href="https://play.golang.org/p/AXcNcTH4oNb">this Go Playground code</a>.</p>  

<p>There are various third party tools, such as <a
href="https://github.com/golang/mock">GoMock</a> and <a
href="https://github.com/vektra/mockery">mockery</a>, that autogenerate
mock code from interface definitions. However, Gerrand <a
href="https://www.philosophicalhacker.com/2016/01/13/should-we-use-mocking-libraries-for-go-testing/">prefers</a>
hand-written fakes:</p>

<div class="BigQuote">
<p>[mocking libraries like gomock] are fine, but I find that on balance the
hand-written fakes tend be easier to reason about and clearer to see what's
going on, but I'm not an enterprise Go programmer so maybe people do need
that so I don't know, but that's my advice.</p>
</div>


<h4>Testable examples</h4>

<p>Go's <a href="https://golang.org/pkg/">package documentation</a> is
generated from comments in the source code. Unlike Javadoc or C#'s
documentation system, which make heavy use of markup in code comments, Go's
<a href="https://blog.golang.org/godoc">approach</a> is that comments in
source code should still be readable in the source, and not sprinkled with
markup.</p>

<p>It takes a similar approach with <a
href="https://blog.golang.org/examples">documentation examples</a>: these
are runnable code snippets that are automatically executed when the tests
are run,  and then included in the generated documentation. Much like Python's <a
href="https://docs.python.org/3/library/doctest.html">doctests</a>,
testable examples write to standard output, and the
output is compared against the expected output, to avoid regressions in the
documented examples. Here's a testable example of an <tt>Abs()</tt>
function:</p>

<pre>
    func ExampleAbs() {
        fmt.Println(Abs(5))
        fmt.Println(Abs(-42))
        // Output:
        // 5
        // 42
    }
</pre>

<p>Example functions need to be in a <tt>*_test.go</tt> file and prefixed
with <tt>Example</tt>. When the test runner executes, the <tt>Output:</tt>
comment is parsed and compared against the actual output, giving a test
failure if they differ. These examples are included in the generated
documentation as runnable Go Playground snippets, as shown in the <a
href="https://golang.org/pkg/strings/#Compare">strings</a> package, for example.</p>


<h4>Benchmarking</h4>

<p>In addition to tests, the <tt>testing</tt> package allows you to run
timed benchmarks. These are used heavily throughout the standard library to
ensure there are not regressions in execution speed. Benchmarks can be run
automatically using <tt>go&nbsp;test</tt> with the <tt>-bench=</tt>
option. Popular Go author Dave Cheney has a good 
summary in his article "<a
href="https://dave.cheney.net/2013/06/30/how-to-write-benchmarks-in-go">How
to write benchmarks in Go</a>".</p>

<p>As an example, here's the standard library's benchmark for the <a
href="https://golang.org/pkg/strings/#TrimSpace"><tt>strings.TrimSpace()</tt></a>
function (note the table-driven approach and the use of <tt>b.Run()</tt> to create
sub-benchmarks):</p>

<pre>
    func BenchmarkTrimSpace(b *testing.B) {
        tests := []struct{ name, input string }{
            {"NoTrim", "typical"},
            {"ASCII", "  foo bar  "},
            {"SomeNonASCII", "    \u2000\t\r\n x\t\t\r\r\ny\n \u3000    "},
            {"JustNonASCII", "\u2000\u2000\u2000☺☺☺☺\u3000\u3000\u3000"},
        }
        for _, test := range tests {
            b.Run(test.name, func(b *testing.B) {
                for i := 0; i &lt; b.N; i++ {
                    TrimSpace(test.input)
                }
            })
        }
    }
</pre>

<p>The <tt>go test</tt> tool will report the numbers; 
a program like <a
href="https://pkg.go.dev/golang.org/x/perf/cmd/benchstat?tab=doc">benchstat</a>
can be used
to compare the before and after timings. Output from benchstat is commonly
included in Go's commit messages showing the performance improvement. For
example, from <a
href="https://go-review.googlesource.com/c/go/+/152917">change
152917</a>:</p>

<pre>
    name                      old time/op  new time/op  delta
    TrimSpace/NoTrim-8        18.6ns ± 0%   3.8ns ± 0%  -79.53%  (p=0.000 n=5+4)
    TrimSpace/ASCII-8         33.5ns ± 2%   6.0ns ± 3%  -82.05%  (p=0.008 n=5+5)
    TrimSpace/SomeNonASCII-8  97.1ns ± 1%  88.6ns ± 1%   -8.68%  (p=0.008 n=5+5)
    TrimSpace/JustNonASCII-8   144ns ± 0%   143ns ± 0%     ~     (p=0.079 n=4+5)
</pre>

<p>This shows that the ASCII fast path for <tt>TrimSpace</tt> made
ASCII-only inputs about five times as fast, though the "SomeNonASCII" sub-test
slowed down by about 9%.</p>

<p>To diagnose where something is running slowly, the built-in <a
href="https://blog.golang.org/pprof">profiling tools</a> can be used, such
as the <tt>-cpuprofile</tt> option when running tests. The built-in
<tt>go&nbsp;tool&nbsp;pprof</tt> displays profile output in a variety of
formats, including <a
href="http://www.brendangregg.com/flamegraphs.html">flame graphs</a>.</p>


<h4>The <tt>go test</tt> command</h4>

<p>Go is opinionated about where tests should reside (in files named
<tt>*_test.go</tt>) and how test functions are named (they must be prefixed
with <tt>Test</tt>). The advantage of being opinionated, however, is that
the <tt>go&nbsp;test</tt> tool knows exactly where to look and how to run the
tests. There's no need for a makefile or metadata describing where the
tests live &mdash; if  files and functions are named in the standard way,
Go already knows where to look.</p>

<p>The <a href="https://golang.org/pkg/cmd/go/internal/test/"><tt>go
test</tt></a> command is simple on the surface, but it has a number of
options for running and filtering tests and benchmarks. Here are some
examples:</p>

<pre>
    go test             # run tests in current directory
    go test package     # run tests for given package
    go test ./...       # run tests for current dir and all sub-packages
    go test -run=foo    # run tests matching regex "foo"
    go test -cover      # run tests and output code coverage
    go test -bench=.    # also run benchmarks
    go test -bench=. -cpuprofile cpu.out
                        # run benchmarks, record profiling info
</pre>

<p>Go test's <tt>-cover</tt> mode produces code coverage profiles that can
be viewed as HTML using <tt>go tool cover
-html=coverage.out</tt>. When explaining <a
href="https://blog.golang.org/cover">how Go's code coverage tool works</a>,
Go co-creator Rob Pike said:</p>

<div class="BigQuote">
<p>For the new test coverage tool for Go, we took a different approach
[than instrumenting the binary] that avoids dynamic debugging. The idea is
simple: Rewrite the package's source code before compilation to add
instrumentation, compile and run the modified source, and dump the
statistics. The rewriting is easy to arrange because the <tt>go</tt>
command controls the flow from source to test to execution.</p>
</div>


<h4>Summing up</h4>

<p>Go's <tt>testing</tt> library is simple but extendable, and the
<tt>go&nbsp;test</tt> runner is a good complement with its test execution,
benchmarking, profiling, and code-coverage reporting. You can <i>go</i> a
long way with the vanilla <tt>testing</tt> package &mdash; I find Go's
minimalist approach to be a forcing function to think differently about
testing and to get the most out of native language features, such as
interfaces and struct composition. But if you need to pull in third party
libraries, they're only a <tt>go&nbsp;get</tt> away.</p>

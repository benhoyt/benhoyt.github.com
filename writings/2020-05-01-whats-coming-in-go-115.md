---
layout: default
title: "What's Coming in Go 1.15"
permalink: /writings/whats-coming-in-go-115/
description: "A general look at what's coming for the Go 1.15 final release in August 2020."
canonical_url: TODO
---
<h1><a href="{{ page.permalink }}">{{ page.title }}</a></h1>
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
</style>

<p>Since the release of Go 1.0, the Go team consistently ship improvements to tooling and the standard library with each version, but have always been very conservative about language changes. Many other languages ship significant language features every release, but Go has only shipped a few minor language changes in the <a href="https://golang.org/doc/devel/release.html">15 versions</a> since 1.0.</p>

<p>This is a conscious design choice: since the 1.0 release, the emphasis from the Go team has been stability and simplicity. The <a href="https://golang.org/doc/go1compat">"Go 1 Compatibility Promise"</a> guarantees that all programs written for Go 1.0 will continue to run correctly, unchanged, for all Go 1.x versions. Go programmers usually see this as a good thing &mdash; their programs continue to "just work", but get consistently faster.</p>

<p>Again in the upcoming 1.15 version, changes to the language spec are basically non-existent; the improvements are in the tooling, the performance of the compiler, and the standard library. As tech lead Russ Cox <a href="https://groups.google.com/d/msg/golang-dev/6mawPNuubJk/fmD_ZFmGBAAJ">notes</a>, 1.15 will be a smaller release due to being extra-conservative given the pandemic:</p>

<div class="BigQuote">
We don't know how difficult the next couple months will be, 
so let's be conservative and not give ourselves unnecessary stress
by checking in last-minute subtle changes that we'll need to debug.
Leave them for the start of the next cycle, where they'll get proper soak time.
...
Go 1.15 is going to be a smaller release than usual, and that's okay.
</div>

<p>As of May 1, Go 1.15 has <a href="https://groups.google.com/d/msg/golang-dev/6mawPNuubJk/Q4rGsztAAQAJ">entered feature freeze</a>, and the Go team plans to release the 1.15 final on August 1, keeping the regular sixth-monthly <a href="https://github.com/golang/go/wiki/Go-Release-Cycle">release cycle</a>.</p>


<h4>A new linker</h4>

<p>One of the largest tooling changes in 1.15 is the completely-rewritten "new linker". The <a href="https://docs.google.com/document/d/1D13QhciikbdLtaI67U6Ble5d_1nsI4befEd6_k1z91U/view">design of the new linker</a>, written by Go core contributor Austin Clements in September 2019, details the motivation for the rewrite and the improvements it will bring.</p>

<p>Three major structural changes in the new linker are:</p>

<ul class="spacylist">
    <li>Move work from the linker to the compiler: this enables parallelization, as compiles are done in parallel across multiple CPUs (or machines), but the link step almost always has to be done in serial at the end of the build. Additionally, the results of the compiler are cached by the Go tooling.</li>
    <li>Improve key data structures, primarily by avoiding strings. The current linker uses a big symbol table indexed by string; the new design avoids strings as much as possible using a symbol-numbering technique.</li>
    <li>Avoid loading all input object files into memory at once: this makes the new linker use less memory for large programs, and allocate less overall (the current linker spends over 20% of its time in the garbage collector).</li>
</ul>

<p>Now that Ken Thompson, author of the original linker, has retired, there's also the matter of maintainability. As Clements <a href="https://docs.google.com/document/d/1D13QhciikbdLtaI67U6Ble5d_1nsI4befEd6_k1z91U/view#heading=h.msfk8kr71vsu">puts it</a>:</p>

<div class="BigQuote">
The original linker was also simpler than it is now and its implementation fit in one Turing award winner’s head, so there’s little abstraction or modularity. Unfortunately, as the linker grew and evolved, it retained its lack of structure, and our sole Turing award winner retired.
</div>


<h4>Smaller binaries</h4>

<p>Related are several improvements that reduce the size of executables built with Go 1.15. As Brad Fitzpatrick <a href="https://twitter.com/bradfitz/status/1256354295823253504">shows</a>, the new linker eliminates a lot more unused code, bringing Fitzpatrick's (rather artificial) test program down from 8.2MB in Go 1.14 to 3.9MB in 1.15.</p>

<p>For more realistic programs, binary sizes go down by <a href="https://twitter.com/davecheney/status/1256386691318771712">3.5%</a> or <a href="https://twitter.com/hugelgupf/status/1256390546412601344">as much as 22%</a>. A web server program that I run went down from 21.4MB to 20.3MB, a reduction of 4.9%.</p>

<p>The biggest contributors to this are the unused code elimination in the new linker, as well as several targeted improvements such as these:</p>

<ul class="spacylist">
    <li><a href="https://go-review.googlesource.com/c/go/+/230544">CL 230544 by Austin Clements</a> reduces the number of stack and register maps in the output. This changes alone reduces the size of the <tt>go</tt> binary by 5.7%, and also speeds up compiles and links by a significant amount.</li>
    <li><a href="https://go-review.googlesource.com/c/go/+/231397">CL 231397 by Cherry Zhang</a> only includes a symbol's type information in the output if it's converted to an interface. This reduces the size of a hello-world program by 7.2%.</li>
    <li><a href="https://go-review.googlesource.com/c/go/+/228111">CL 228111 by Brad Fitzpatrick</a> avoids including TLS client or server code in the output if only one of them is used, reducing the size of a "TLS dial hello world" program by 3.2%.</li>
</ul>

<p>In terms of compiler work, even single digit percentages are a very good start. And with the new linker in place, I'm sure there will be more binary size improvements in Go version 1.16.</p>


<h4>Performance improvements</h4>

<p>Go 1.15 introduces too many performance improvements to list, but here are a few of the more general optimizations that stand out:</p>

<ul class="spacylist">
    <li><a href="https://go-review.googlesource.com/c/go/+/226367/">CL 226367 by Josh Bleecher Snyder</a> allows the compiler to use more x86 registers for the garbage collector's write barrier calls, resulting in slightly smaller binaries and a 1% improvement in compile times.</li>
    <li><a href="https://go-review.googlesource.com/c/go/+/216401/">CL 216401 again by Snyder</a> avoids allocating when converting small integers to an interface value (like "boxing" in other languages), giving a 2% improvement in compile-to-assembly times. This is similar in spirit to Python's <a href="https://github.com/python/cpython/blob/c95e691c904bb5ebd91825efa81b93cb9e354a85/Objects/longobject.c#L35-L66">small integer caching</a> optimization, though it happens in Go far less often due to static typing.</li>
    <li><a href="https://go-review.googlesource.com/c/go/+/221182/">CL 221182 by Michael Knyszek</a> significantly increases throughput for memory allocation of large blocks (more than twice as fast for blocks 12KB or larger).</li>
</ul>


<h4>Other tooling improvements</h4>

<p>Go is well known for its stable and fast tooling, notably <tt>go build</tt>, which is a single command that fetches the dependencies for and compiles your entire project (with automatic caching of compiled packages for incremental builds).</p>

<p>In Go 1.15 there are two improvements for handling "modules" (Go's dependency management and versioning system):</p>

<ul class="spacylist">
    <li>The <tt>GOPROXY</tt> environment variable <a href="https://go-review.googlesource.com/c/go/+/226460/">now handles</a> fallback proxies for fetching modules, using the <tt>|</tt> separator. The default value of <tt>proxy.golang.org,direct</tt> was not changed.</li>
    <li>The <tt>GOMODCACHE</tt> environment variable <a href="https://github.com/golang/go/issues/34527">allows</a> CI and build tooling to override the default cache directory for downloaded module source code. This is in addition to the long-standing <tt>GOCACHE</tt> setting that allows users to control where cached compilation output is saved.</li>
</ul>

<p>Go 1.15 removes two older ports: <a href="https://github.com/golang/go/issues/37610">darwin/386</a> and <a href="https://github.com/golang/go/issues/37611">darwin/arm</a>, which provided 32-bit binaries on macOS and other Apple OSes. Brad Fitzpatrick notes that macOS Catalina doesn't support running 32-bit apps, and <a href="https://github.com/golang/go/issues/34749#issuecomment-539223389">describes</a> the advantages of removing these:

<div class="BigQuote">
<ul>
    <li>builder time (and we have very limited Mac resources, so I'd prefer to not waste their time on ~useless build configs)</li>
    <li>code size (less code is better)</li>
    <li>in a couple more years it won't even be possible to run a darwin/386 binary on any supported Go build</li>
</ul>
</div>

<p>These ports were announced as deprecated in the Go 1.14 release, and will be removed in Go 1.15.</p>

<p>On the other hand, the linux/arm64 port was <a href="https://github.com/golang/go/issues/35593">upgraded</a> to a <a href="https://github.com/golang/go/wiki/PortingPolicy#first-class-ports">"first class port"</a>, which means that broken builds block releases, and official binaries as well as install documentation are provided by Google. Again, Fitzpatrick provides the rationale:</p>

<div class="BigQuote">
Currently, linux/arm is a "first class port" but linux/arm64 is not. At this point, arm64 is probably equally or more important than arm. I think we should add linux/arm64 to the first class port set.
</div>

<p>On Windows, Go 1.15 now generates <a href="https://en.wikipedia.org/wiki/Address_space_layout_randomization">ASLR</a> executables <a href="https://github.com/golang/go/issues/35192">by default</a>. ASLR is a security technique that uses position-independent executables so that Windows can randomize the addresses of various data areas on startup.</p>


<h4>Standard library improvements</h4>

<p>As usual, there have been many smaller additions and improvements to Go's standard library. A few of the more user-facing changes are:</p>

<p>The <tt>flag</tt> package <a href="https://github.com/golang/go/issues/37533">now exits</a> with status code zero when <tt>-h</tt> or <tt>--help</tt> is specified. This is because if the user explicitly specifies <tt>-h</tt>, it's not an error. This change makes Go more consistent with other language's argument parsers.</p>

<p>The <tt>net/url</tt> package <a href="https://github.com/golang/go/issues/34855">adds</a> a new <tt>URL.Redacted()</tt> method that returns the URL as a string, but with the password redacted (replaced by <tt>xxxxx</tt>).</p>

<p>The <tt>testing</tt> package's test and benchmark types <a href="https://github.com/golang/go/issues/35998">add</a> a <tt>TempDir()</tt> method that lazily creates a temporary directory for the current test, and deletes it automatically when the test is finished.</p>

<p>A new <tt>time/tzdata</tt> package was <a href="https://github.com/golang/go/issues/38017">added</a> to allow embedding a static copy of the time zone database in executables. Because it adds about 800KB to the executable, it's opt-in: either by importing the <tt>time/tzdata</tt> package, or by compiling with the <tt>timetzdata</tt> build tag. The embedded database can make time zone database access more consistent and reliable on some systems (particularly Windows), and it may also be useful in virtualized environments like Docker containers and the <a href="https://github.com/golang/go/issues/38727#issuecomment-621537845">Go playground</a>.


<h4>Parting thoughts</h4>

<p>It's worth reading the comments on various issues and Gerrit code review links: you can really see how thorough the Go team is about code review, and their emphasis on code and test quality as well as clear documentation. Go uses GitHub issues for all bugs and feature proposals: see the list of <a href="https://github.com/golang/go/milestone/114?closed=1">closed issues in the Go 1.15 milestone</a> for further exploration.</p>

<p>The Go 1.15 final release is still over 2 months away, but you can test against the latest version using the <a href="https://godoc.org/golang.org/dl/gotip"><tt>gotip</tt></a> tool, or wait for the beta release &mdash; scheduled for June 1.</p>

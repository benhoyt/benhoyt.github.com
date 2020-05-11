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

<p>Go 1.15, the Go programming language's 15th major version, is due out on August 1. It will be a release with fewer changes than usual, but many of the major changes are behind-the-scenes or in the tooling: for example, the new linker, which will speed up build times and reduce binary size.</p>

<p>Since the release of Go 1.0, the Go team consistently ship improvements to tooling and the standard library with each version, but have always been conservative about language changes. Many other languages ship significant language features every release, but Go has only shipped a few minor language changes in the <a href="https://golang.org/doc/devel/release.html">versions</a> since 1.0.</p>

<p>This is a conscious design choice: since the 1.0 release, the emphasis from the Go team has been stability and simplicity. The <a href="https://golang.org/doc/go1compat">"Go 1 Compatibility Promise"</a> guarantees that all programs written for Go 1.0 will continue to run correctly, unchanged, for all 1.x versions. Go programmers usually see this as a good thing &mdash; their programs continue to "just work", but get consistently faster.</p>

<p>Again in the upcoming 1.15 version, changes to the language spec are basically non-existent; the improvements are in the tooling, the performance of the compiler, and the standard library. As tech lead Russ Cox <a href="https://groups.google.com/d/msg/golang-dev/6mawPNuubJk/fmD_ZFmGBAAJ">notes</a>, the core developers are planning to be extra-conservative in 1.15 given the pandemic:</p>

<div class="BigQuote">
We don't know how difficult the next couple months will be, 
so let's be conservative and not give ourselves unnecessary stress
by checking in last-minute subtle changes that we'll need to debug.
Leave them for the start of the next cycle, where they'll get proper soak time.
...
Go 1.15 is going to be a smaller release than usual, and that's okay.
</div>

<p>On May 1, Go 1.15 <a href="https://groups.google.com/d/msg/golang-dev/6mawPNuubJk/Q4rGsztAAQAJ">entered feature freeze</a>, and the Go team plans to release the 1.15 final on August 1, keeping the regular sixth-monthly <a href="https://github.com/golang/go/wiki/Go-Release-Cycle">release cycle</a>.</p>

<p>For those unfamiliar with Go's development model, it's somewhat unique for open source languages. The language was designed at Google and most of the core developers work there (so ongoing development is effectively sponsored by Google). However, the language has a permissive, <a href="https://golang.org/LICENSE">BSD-style license</a>, and development is done in the open, with general discussion on the <a href="https://groups.google.com/forum/#!forum/golang-dev">golang-dev mailing list</a>.
Changes or new features are proposed and discussed in the repository's <a href="https://github.com/golang/go/issues">GitHub issues</a>, and code review is done via comments on the <a href="https://go-review.googlesource.com/">Gerrit code changes</a> (called "changelists" or "CL"s).</p>


<h4>A new linker</h4>

<p>One of the largest tooling changes in 1.15 is the completely-rewritten "new linker". The <a href="https://docs.google.com/document/d/1D13QhciikbdLtaI67U6Ble5d_1nsI4befEd6_k1z91U/view">design of the new linker</a>, written by Go core contributor Austin Clements in September 2019, details the motivation for the rewrite and the improvements it will bring.</p>

<p>There are three major structural changes in the new linker:</p>

<ul class="spacylist">
    <li>Moving work from the linker to the compiler: this enables parallelization, as compiles are done in parallel across multiple CPUs (or machines), but the link step almost always has to be done in serial at the end of the build. Additionally, the results of the compiler are cached by the Go tooling.</li>
    <li>Improving key data structures, primarily by avoiding strings. The current linker uses a big symbol table indexed by string; the new design avoids strings as much as possible using a symbol-numbering technique.</li>
    <li>Avoiding loading all input object files into memory at once: this makes the new linker use less memory for large programs, and allocate less overall (the current linker spends over 20% of its time in the garbage collector).</li>
</ul>

<p>Now that Ken Thompson, author of the original linker, has retired, there's also the matter of maintainability. As Clements <a href="https://docs.google.com/document/d/1D13QhciikbdLtaI67U6Ble5d_1nsI4befEd6_k1z91U/view#heading=h.msfk8kr71vsu">puts it</a>:</p>

<div class="BigQuote">
The original linker was also simpler than it is now and its implementation fit in one Turing award winner’s head, so there’s little abstraction or modularity. Unfortunately, as the linker grew and evolved, it retained its lack of structure, and our sole Turing award winner retired.
</div>

<p>Given the sweeping, long-term changes, this work is being done on a branch (<tt>dev.link</tt>), and merged into <tt>master</tt> only at stable points. Than McIntosh, working on the new linker, <a href="https://groups.google.com/d/msg/golang-dev/LxS7R7GDZwA/7AwZes0jAgAJ">states</a> what has already been done for 1.15: most of the structural improvements in the design document have been completed, including the new object file format and tighter symbol representation. Builds are already faster and use less memory than in 1.14, but some features (for example, using the DWARF 5 debugging format) will have to wait for 1.16.</p>

<p>Clements <a href="https://groups.google.com/d/msg/golang-dev/LxS7R7GDZwA/5xzw204pAgAJ">adds more detail</a> on the parallelization efforts, as well as the gradual way this is being phased in:</p>

<div class="BigQuote">
We [...] also made many other improvements along the way like parallelizing key phases and removing a lot of unnecessary I/O synchronization. In order to best build on all of the past work on the linker, we did this conversion as a "wavefront", with a phase that converted from the new representation to the old representation that we pushed further and further back in the linker. We're not done yet: that conversion phase is still there, though exactly when it happens and what it does depends on the platform. For amd64 ELF platforms, it's quite late and does relatively little. For other platforms, it's not quite as far back and does more, so the wins aren't as big yet. Either way, there's more to look forward to for 1.16.
</div>

<p>For now, the linker still converts back to the old in-memory representation for the last part of the linking. Presumably in a future version of Go these last steps will be moved into the new linker and the conversion phase will be removed entirely, reducing link time and memory usage further.</p>


<h4>Smaller binaries</h4>

<p>Related are several improvements that reduce the size of executables built with Go 1.15. As Brad Fitzpatrick <a href="https://twitter.com/bradfitz/status/1256354295823253504">shows</a>, the new linker eliminates a lot more unused code, bringing Fitzpatrick's (rather artificial) test program down from 8.2MB in Go 1.14 to 3.9MB in 1.15.</p>

<p>For more realistic programs, binary sizes go down by <a href="https://twitter.com/davecheney/status/1256386691318771712">3.5%</a> or <a href="https://twitter.com/hugelgupf/status/1256390546412601344">as much as 22%</a>. A web server program that I run went down from 21.4MB to 20.3MB, a reduction of 4.9%.</p>

<p>The biggest contributors to this are the unused code elimination in the new linker, as well as several targeted improvements such as Clements' <a href="https://go-review.googlesource.com/c/go/+/230544">CL 230544</a>, which reduces the number of stack and register maps included in the executable. These maps are used by Go's garbage collector to determine what objects are alive when, but are now only needed at call sites, instead of every instruction. This change reduces the size of the <tt>go</tt> binary by 5.7%, and also speeds up compiles and links by a significant amount.</p>

<p>Due to Go's ability to inspect types at runtime (the <a href="https://golang.org/pkg/reflect/">reflect</a> package), Go binaries contain a significant amount of type information. <a href="https://go-review.googlesource.com/c/go/+/231397">CL 231397 by Cherry Zhang</a> only includes a symbol's type information in the output if it's converted to an interface (only values converted to an interface can be used with reflection). This change reduces the size of a hello-world program by 7.2%.</p>

<p>There are a few other minor improvements to binary size, such as Brad Fitzpatrick's <a href="https://go-review.googlesource.com/c/go/+/228111">CL 228111</a>, which avoids including TLS client or server code in the output if only one of them is used, reducing the size of a <a href="https://play.golang.org/p/3FNZONT7Wl8">TLS dial hello world</a> program by 3.2%.</p>


<h4>Performance improvements</h4>

<p>Go 1.15 introduces many minor performance improvements, but two of the more notable ones are from prolific non-Google contributor Josh Bleecher Snyder. <a href="https://go-review.googlesource.com/c/go/+/216401/">CL 216401</a> avoids allocating memory when converting small integers to an interface value, giving a 2% improvement in compile-to-assembly times. Converting to interface is like "boxing" in other languages, and the optimization is similar in spirit to Python's <a href="https://github.com/python/cpython/blob/c95e691c904bb5ebd91825efa81b93cb9e354a85/Objects/longobject.c#L35-L66">small integer caching</a>, though it happens in Go far less often due to static typing.</p>

<p>The second of Snyder's changes is <a href="https://go-review.googlesource.com/c/go/+/226367/">CL 226367</a>, in the internals of the compiler and runtime, which allows the compiler to use more x86 registers for the garbage collector's write barrier calls. Go uses a write barrier (kind of like a lock) to maintain data integrity on the heap when the GC is running concurrently with user code (<a href="https://www.ardanlabs.com/blog/2018/12/garbage-collection-in-go-part1-semantics.html">detailed analysis of Go's GC</a>). This results in slightly smaller binaries and a 1% improvement in compile times.</p>

<p>Michael Knysze, on the Go team at Google, significantly increased throughput of memory allocation for large blocks by <a href="https://go-review.googlesource.com/c/go/+/221182/">redesigning</a> the memory allocator's "mcentral" data structure to reduce lock contention. The new allocation code is more than twice as fast for blocks 12KB or larger.</p>


<h4>Tooling and ports</h4>

<p>Go is known for its stable and fast tooling, notably <tt>go build</tt>, which is a single command that fetches a project's dependencies and compiles it (with automatic caching of compiled packages for incremental builds).</p>

<p>Go "modules" (Go's dependency management system) was first introduced in Go 1.11, and support for a module mirror or "proxy" was added in 1.13. Version 1.15 adds support for a <a href="https://go-review.googlesource.com/c/go/+/226460/">fallback proxy</a>, allowing the <tt>go</tt> tool to fall back to a secondary host if the first one fails when downloading module source code. Fallbacks are specified using the <tt>GOMODCACHE</tt> environment variable's new <tt>|</tt> separator.</p>

<p>Go 1.15 removes two older ports: <a href="https://github.com/golang/go/issues/37610">darwin/386</a> and <a href="https://github.com/golang/go/issues/37611">darwin/arm</a>, which provided 32-bit binaries on macOS and other Apple OSes. Fitzpatrick <a href="https://github.com/golang/go/issues/34749">notes</a> that macOS Catalina doesn't support running 32-bit apps, and removing those ports will help free up macOS build machines as well as shrinking the compiler slightly. These ports were announced as deprecated in the Go 1.14 release, and will be removed in Go 1.15.</p>

<p>On the other hand, the linux/arm64 port was upgraded to a <a href="https://github.com/golang/go/wiki/PortingPolicy#first-class-ports">"first class port"</a>, which means that broken builds block releases, and official binaries as well as install documentation are provided by the Go team. As Fitzpatrick <a href="https://github.com/golang/go/issues/35593">notes</a>, Linux 64-bit ARM is at least as important now as 32-bit ARM, which is already a first-class port.</p>

<p>On Windows, Go 1.15 now generates <a href="https://en.wikipedia.org/wiki/Address_space_layout_randomization">Address Space Layout Randomization</a> (ASLR) executables <a href="https://github.com/golang/go/issues/35192">by default</a>. ASLR uses position-independent code to randomize the addresses of various data areas on startup, making it harder for attackers to predict target addresses and create memory-corruption exploits.</p>


<h4>Standard library additions</h4>

<p>The Go's standard library is large but fairly stable, and in Go 1.15 only relatively minor features were added.</p>

<p>The standard library's <tt>testing</tt> package is quite minimalist &mdash; the Go philosophy is to avoid domain-specific languages for writing tests and assertions, and instead to just write plain Go, which the developer already knows. But the core developers found creating a temporary directory useful enough to approve <a href="https://github.com/golang/go/issues/35998">adding</a> a <tt>TempDir()</tt> method that lazily creates a temporary directory for the current test, and deletes it automatically when the test is finished.</p>

<p>The <tt>net/url</tt> package <a href="https://github.com/golang/go/issues/34855">adds</a> a new <tt>URL.Redacted()</tt> method that returns the URL as a string, but with the password redacted (replaced by <tt>xxxxx</tt>). URLs with passwords such as <tt>https://username:password@example.com/</tt> are not usually used in browsers anymore, but are still surprisingly common in scripts and tools. <tt>Redacted()</tt> can be used to log URLs more securely, in line with <a href="https://tools.ietf.org/html/rfc3986">RFC 3986</a>'s guidelines to not render the part after the <tt>:</tt> as clear text.</p>

<p>A new <tt>time/tzdata</tt> package was <a href="https://github.com/golang/go/issues/38017">added</a> to allow embedding a static copy of the time zone database in executables. Because it adds about 800KB to the executable, it's opt-in: either by importing the <tt>time/tzdata</tt> package, or by compiling with the <tt>timetzdata</tt> build tag. The embedded database can make time zone database access more consistent and reliable on some systems (particularly Windows), and it may also be useful in virtualized environments like Docker containers and the <a href="https://github.com/golang/go/issues/38727#issuecomment-621537845">Go playground</a>.


<h4>Parting thoughts</h4>

<p>Go uses GitHub issues to track all bugs and feature requests: you can scan the list of <a href="https://github.com/golang/go/milestone/114?closed=1">closed issues in the Go 1.15 milestone</a> for further exploration.</p>

<p>The 1.15 final release is still over 2 months away, but if you're an early adopter you can easily test your own code against the latest version using the <a href="https://godoc.org/golang.org/dl/gotip"><tt>gotip</tt></a> tool, or wait for the binary beta release &mdash; scheduled for June 1. Bugs found now will almost certainly be fixed before the 1.15 final.</p>
